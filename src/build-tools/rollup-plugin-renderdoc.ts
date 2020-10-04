/* eslint import/no-extraneous-dependencies: [1, { devDependencies: true }], no-console: 0 */

import * as path from 'path'
import { promises as fs } from 'fs'
import { glob } from 'matched'
import { mdConvert, rstConvert, Document } from '../markup'

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

export default function renderdoc(config: Partial<Config> = {}) {
	const converters = config.converters ?? DEFAULT_CONVERTERS
	const include: string[] = typeof config.include === 'string' ? [config.include] : config.include || []
	const exclude: string[] = typeof config.exclude === 'string' ? [config.exclude] : config.exclude || []
	const patterns = include.concat(exclude.map(pattern => `!${pattern}`))
	
	async function doGlob(id: string): Promise<string[]> {
		const stats = await fs.stat(id)
		if (!stats.isDirectory()) return []
		const paths = await glob(patterns, { realpath: true, cwd: id })
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
				const content = await fs.readFile(p, { encoding: 'utf-8' })
				if (!(path.extname(p) in converters)) throw new Error(`No converter for file ${p} registered`)
				const convert = converters[path.extname(p)]
				return convert(content)
			}))
			const map = zipObject(paths.map(p => path.basename(p)), contents)
			return `export default ${JSON.stringify(map)}`
		},
	}
}
