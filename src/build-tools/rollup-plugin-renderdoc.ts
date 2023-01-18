/* eslint import/no-extraneous-dependencies: [1, { devDependencies: true }], no-console: 0 */

import * as path from 'path'
import { promises as fs } from 'fs'
import { globby } from 'globby'
import { Plugin } from 'vite'

import {
	mdConvert, rstConvert, Document, ParseError, ASTError,
} from '../markup'

function zipObject<V>(keys: string[], values: V[]): {[k: string]: V} {
	if (keys.length !== values.length) {
		throw new Error(`Lengths do not match keys.length (${keys.length}) != values.length (${values.length})`)
	}
	return keys.reduce((prev, k, i) => ({ ...prev, [k]: values[i] }), {})
}

export interface Converter {
	(source: string): Document
}

export interface Config {
	converters: {[ext: string]: Converter}
	include?: string | string[]
	exclude?: string | string[]
}

export const DEFAULT_CONVERTERS: {[ext: string]: Converter} = {
	'.md': mdConvert,
	'.rst': rstConvert,
}

type Pos = { line: number; column: number } | number | undefined
type OnError = (e: { id: string, message: string } | Error, pos?: Pos) => never

export const renderdoc = (config: Partial<Config> = {}): Plugin => {
	const converters = config.converters ?? DEFAULT_CONVERTERS
	const include: string[] = typeof config.include === 'string' ? [config.include] : config.include || []
	const exclude: string[] = typeof config.exclude === 'string' ? [config.exclude] : config.exclude || []
	const patterns = include.concat(exclude.map((pattern) => `!${pattern}`))

	async function loadPosts(dir: string, onError: OnError = (e) => {
		throw new Error(e.message)
	}) {
		const paths = await doGlob(dir)
		if (paths.length === 0) return null
		const contents = await Promise.all(paths.map(async (p) => {
			const code = await fs.readFile(p, { encoding: 'utf-8' })
			const ext = path.extname(p)
			if (!(ext in converters)) onError({ id: p, message: `No converter for ${ext} registered` })
			const convert = converters[path.extname(p)]
			try {
				return convert(code)
			} catch (eOrig) {
				let e: Error
				let pos: Pos
				if (eOrig instanceof ParseError) {
					e = eOrig
					e.message = `Error parsing ${ext} file: ${eOrig.orig.message}`
					pos = eOrig.pos
				} else if (eOrig instanceof ASTError) {
					e = eOrig
					e.message = `Error converting the ${ext} AST: ${eOrig.message}`
					pos = eOrig.loc || eOrig.pos
				} else {
					e = eOrig instanceof Error ? eOrig : new Error((eOrig as object).toString())
					e.message = `Unexpected error parsing or converting ${ext} file: ${e.message}`
				}
				(e as any).id = p // TODO: why?
				onError(e, pos)
			}
		}))
		
		const map = zipObject(paths.map((p) => path.basename(p)), contents)
		for (const [p, content] of Object.entries(map)) {
			if (!content) {
				console.log(`Skipped ${p}`)
				delete map[p]
			} else if (content.metadata.draft) {
				console.log(`Skipped ${p} (“${content.title}” is a draft)`)
				delete map[p]
			}
		}
		return map
	}
	
	async function doGlob(id: string): Promise<string[]> {
		const isDir = await fs.stat(id).then((s) => s.isDirectory()).catch(() => false)
		if (!isDir) return []
		const paths = await globby(patterns, { cwd: id, absolute: true })
		return paths
	}
	
	return {
		name: 'renderdoc',
		async resolveId(id: string, importer?: string) {
			if (!id.startsWith('./') && !id.startsWith('../')) return null
			const rel = importer === undefined
				? id
				: path.join(path.dirname(importer), id)
			if ((await doGlob(rel)).length === 0) return null
			return rel
		},
		async load(id: string) {
			const paths = await doGlob(id)
			for (const p of paths) this.addWatchFile(p)
			const map = await loadPosts(id, this.error)
			return `export default ${JSON.stringify(map)}`
		},
		configureServer(server) {
			server.middlewares.use(async (req, res, next) => {
				if (req.url === '/src/posts/rawPosts') {
					const code = await loadPosts('posts/rawPosts')
					res.setHeader('Content-Type', 'application/javascript')
					res.end(code)
					return
				}
				next()
			})
		},
	}
}

export default renderdoc
