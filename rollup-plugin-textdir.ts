/* eslint import/no-extraneous-dependencies: [1, { devDependencies: true }], no-console: 0 */

import { walk } from 'https://deno.land/std/fs/mod.ts'
import * as path from 'https://deno.land/std/path/mod.ts'

function zipObject(keys, values) {
	if (keys.length !== values.length) {
		throw new Error(`Lengths do not match keys.length (${keys.length}) != values.length (${values.length})`)
	}
	return keys.reduce((prev, k, i) => ({ ...prev, [k]: values[i] }), {})
}

interface Config {
	include?: string[],
	exclude?: string[],
}

export default function textdir(config: Config = {}) {
	let include_globs
	let exclude_globs
	if (typeof config === 'string') {
		include_globs = [config]
	} else if (Array.isArray(config)) {
		include_globs = config
	} else {
		include_globs = config.include || []
		exclude_globs = config.exclude || []
	}
	const match = include_globs.map(path.globToRegExp)
	const skip = exclude_globs.map(path.globToRegExp)
	
	async function doGlob(id) {
		const stats = await Deno.stat(id)
		if (!stats.isDirectory()) return (async function*() {})()
		return walk(id, { match, skip })
	}
	
	return {
		name: 'textdir',
		async resolveId(id, importer) {
			const rel = importer === undefined
				? id
				: path.join(path.dirname(importer), id)
			for await (const _ of await doGlob(rel)) {
				return rel
			}
			return null
		},
		async load(id) {
			const paths = []
			for await (const path of await doGlob(id)) paths.push(path)
			if (paths.length === 0) return null
			const contents = await Promise.all(paths.map(p => {
				const decoder = new TextDecoder('utf-8')
				return Deno.readFile("hello.txt").then(d => decoder.decode(d))
			}))
			const map = zipObject(paths.map(p => path.basename(p)), contents)
			return `export default ${JSON.stringify(map)}`
		},
	}
}
