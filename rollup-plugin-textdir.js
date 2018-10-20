/* eslint import/no-extraneous-dependencies: [1, { devDependencies: true }], no-console: 0 */

import * as path from 'path'
import { promises as fs } from 'fs'
import { promise as glob } from 'matched'

function zipObject(keys, values) {
	if (keys.length !== values.length) {
		throw new Error(`Lengths do not match keys.length (${keys.length}) != values.length (${values.length})`)
	}
	return keys.reduce((prev, k, i) => ({ ...prev, [k]: values[i] }), {})
}

export default function textdir(config = {}) {
	let include
	let exclude
	if (typeof config === 'string') {
		include = [config]
	} else if (Array.isArray(config)) {
		include = config
	} else {
		include = config.include || []
		exclude = config.exclude || []
	}
	const patterns = include.concat(exclude.map(pattern => `!${pattern}`))
	
	async function doGlob(id) {
		const stats = await fs.stat(id)
		if (!stats.isDirectory()) return []
		const paths = await glob(patterns, { realpath: true, cwd: id })
		return paths
	}
	
	return {
		name: 'textdir',
		async resolveId(id, importer) {
			const rel = importer === undefined
				? id
				: path.join(path.dirname(importer), id)
			if (doGlob(rel).length === 0) return null
			return rel
		},
		async load(id) {
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
