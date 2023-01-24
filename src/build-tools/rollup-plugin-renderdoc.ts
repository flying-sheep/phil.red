/* eslint import/no-extraneous-dependencies: [1, { devDependencies: true }], no-console: 0 */

import { promises as fs } from 'fs'
import * as path from 'path'
import { cwd } from 'process'

import { globby } from 'globby'
import { Plugin } from 'vite'

import { Document, ParseError, ASTError } from '../markup'

import mdConvert from './md'
import rstConvert from './rst'

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

const throwError: OnError = (e) => {
	throw new Error(e.message)
}

export const renderdoc = (config: Partial<Config> = {}): Plugin => {
	const converters = config.converters ?? DEFAULT_CONVERTERS
	const include: string[] = typeof config.include === 'string' ? [config.include] : config.include ?? []
	const exclude: string[] = typeof config.exclude === 'string' ? [config.exclude] : config.exclude ?? []
	const patterns = include.concat(exclude.map((pattern) => `!${pattern}`))

	async function loadPosts(dir: string, onError: OnError = throwError) {
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
					pos = eOrig.loc ?? eOrig.pos
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
	
	async function createCode(id: string, onError: OnError = throwError) {
		const map = await loadPosts(id)
		if (map === null) return null
		return `export default ${JSON.stringify(map)}`
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
			return `${rel}/__renderdoc`
		},
		async load(id: string) {
			if (!id.endsWith('/__renderdoc')) return null
			const dir = path.dirname(id)
			const paths = await doGlob(dir)
			for (const p of paths) this.addWatchFile(p)
			return createCode(dir, this.error)
		},
		configureServer(server) {
			server.middlewares.use(async (req, res, next) => {
				if (!req.url?.endsWith('__renderdoc')) {
					return next()
				}
				const code = await createCode(`.${path.dirname(req.url)}`)
				if (code === null) throw new Error(`${req.url} not found from ${cwd()}`)
				res.setHeader('Content-Type', 'application/javascript')
				res.end(code)
			})
		},
	}
}

export default renderdoc
