/* eslint import/no-extraneous-dependencies: [1, { devDependencies: true }], no-console: 0 */

import * as path from 'path'
import { promises as fs } from 'fs'
import * as glob from 'globby'
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
				const content = await fs.readFile(p, { encoding: 'utf-8' })
				const ext = path.extname(p)
				if (!(ext in converters)) this.error({ id: p, message: `No converter for ${ext} registered` })
				const convert = converters[path.extname(p)]
				try {
					return convert(content)
				} catch (e) {
					let message: string
					let pos: number | undefined
					if (e instanceof ParseError) {
						message = `Error parsing ${ext} file: ${e.orig.message}`
						pos = e.position
						e = e.orig // eslint-disable-line no-ex-assign
					} else if (e instanceof ASTError) {
						message = `Error converting the ${ext} AST: ${e.message}`
					} else {
						message = `Unexpected error parsing or converting ${ext} file: ${e.message}`
						pos = undefined
					}
					this.error({
						message, pos, id: p, parserError: e,
					})
				}
			}))
			const map = zipObject(paths.map((p) => path.basename(p)), contents)
			return `export default ${JSON.stringify(map)}`
		},
	}
}

export default renderdoc
