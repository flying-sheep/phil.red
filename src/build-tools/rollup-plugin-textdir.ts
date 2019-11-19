/* eslint import/no-extraneous-dependencies: [1, { devDependencies: true }], no-console: 0 */

import * as path from 'path'
import { promises as fs } from 'fs'
import { glob } from 'matched'

function zipObject<V>(keys: string[], values: V[]): {[k: string]: V} {
	if (keys.length !== values.length) {
		throw new Error(`Lengths do not match keys.length (${keys.length}) != values.length (${values.length})`)
	}
	return keys.reduce((prev, k, i) => ({ ...prev, [k]: values[i] }), {})
}

interface Config {
	include?: string | string[]
	exclude?: string | string[]
}

export default function textdir(config: Config | string | string[] = {}) {
	let include: string[]
	let exclude: string[] = []
	if (typeof config === 'string') {
		include = [config]
	} else if (Array.isArray(config)) {
		include = config
	} else {
		include = typeof config.include === 'string' ? [config.include] : config.include || []
		exclude = typeof config.exclude === 'string' ? [config.exclude] : config.exclude || []
	}
	const patterns = include.concat(exclude.map(pattern => `!${pattern}`))
	
	async function doGlob(id: string): Promise<string[]> {
		const stats = await fs.stat(id)
		if (!stats.isDirectory()) return []
		const paths = await glob(patterns, { realpath: true, cwd: id })
		return paths
	}
	
	return {
		name: 'textdir',
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
			const contents = await Promise.all(paths.map(
				p => fs.readFile(p, { encoding: 'utf-8' }),
			))
			const map = zipObject(paths.map(p => path.basename(p)), contents)
			return `export default ${JSON.stringify(map)}`
		},
	}
}
