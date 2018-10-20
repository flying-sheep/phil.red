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
	
	return {
		name: 'textdir',
		async resolveId(importee, importer) {
			const rel = importer === undefined
				? importee
				: path.join(path.dirname(importer), importee)
			const stats = await fs.stat(rel)
			if (stats.isDirectory()) return rel
			return null
		},
		async load(id) {
			const stats = await fs.stat(id)
			if (!stats.isDirectory()) return null
			const paths = await glob(patterns, { realpath: true, cwd: id })
			if (paths.length === 0) return null
			const contents = await Promise.all(paths.map(
				p => fs.readFile(p, { encoding: 'utf-8' }),
			))
			const map = zipObject(paths.map(p => path.basename(p)), contents)
			return `export default ${JSON.stringify(map)}`
		},
	}
}
