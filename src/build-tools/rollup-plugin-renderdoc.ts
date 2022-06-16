/* eslint import/no-extraneous-dependencies: [1, { devDependencies: true }], no-console: 0 */

import * as path from 'path'
import { promises as fs } from 'fs'
import glob from 'globby'
import { PluginImpl } from 'rollup'

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

export const renderdoc: PluginImpl<Partial<Config>> = (config: Partial<Config> = {}) => {
	const converters = config.converters ?? DEFAULT_CONVERTERS
	const include: string[] = typeof config.include === 'string' ? [config.include] : config.include || []
	const exclude: string[] = typeof config.exclude === 'string' ? [config.exclude] : config.exclude || []
	const patterns = include.concat(exclude.map((pattern) => `!${pattern}`))
	
	async function doGlob(id: string): Promise<string[]> {
		const stats = await fs.stat(id)
		if (!stats.isDirectory()) return []
		const paths = await glob(patterns, { cwd: id, absolute: true })
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
			if (paths.length === 0) return null
			const contents = await Promise.all(paths.map(async (p) => {
				this.addWatchFile(p)
				const code = await fs.readFile(p, { encoding: 'utf-8' })
				const ext = path.extname(p)
				if (!(ext in converters)) this.error({ id: p, message: `No converter for ${ext} registered` })
				const convert = converters[path.extname(p)]
				try {
					return convert(code)
				} catch (eOrig) {
					let e: Error
					let pos: { line: number; column: number } | number | undefined
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
					this.error(e, pos)
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
			return `export default ${JSON.stringify(map)}`
		},
	}
}

export default renderdoc
