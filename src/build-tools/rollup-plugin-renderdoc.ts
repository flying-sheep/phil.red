/* eslint import/no-extraneous-dependencies: [1, { devDependencies: true }], no-console: 0 */

import { promises as fs } from 'fs'
import * as path from 'path'
import { cwd } from 'process'

import type { Node, ObjectExpression, Property } from 'estree'
import { asyncWalk } from 'estree-walker'
import { globby } from 'globby'
import MagicString from 'magic-string'
import type { PluginContext, AcornNode } from 'rollup'
import type { Plugin } from 'vite'

import { Document, Type, ParseError, ASTError } from '../markup'

import mdConvert from './md'
import rstConvert from './rst'

function zipObject<V>(keys: string[], values: V[]): { [k: string]: V } {
	if (keys.length !== values.length) {
		throw new Error(
			`Lengths do not match keys.length (${keys.length}) != values.length (${values.length})`,
		)
	}
	return keys.reduce((prev, k, i) => ({ ...prev, [k]: values[i] }), {})
}

function getProp(node: ObjectExpression, key: string): Property | undefined {
	for (const prop of node.properties) {
		if (prop.type === 'Property' && prop.key.type === 'Literal' && prop.key.value === key) {
			return prop
		}
	}
	return undefined
}

function getVal(prop: Property | undefined) {
	if (prop?.type !== 'Property' || prop.value.type !== 'Literal') return undefined
	return prop.value.value
}

export interface Converter {
	(source: string): Document
}

export interface Config {
	converters: { [ext: string]: Converter }
	include?: string | string[]
	exclude?: string | string[]
}

export const DEFAULT_CONVERTERS: { [ext: string]: Converter } = {
	'.md': mdConvert,
	'.rst': rstConvert,
}

export const renderdoc = (config: Partial<Config> = {}): Plugin => {
	const converters = config.converters ?? DEFAULT_CONVERTERS
	const include: string[] =
		typeof config.include === 'string' ? [config.include] : config.include ?? []
	const exclude: string[] =
		typeof config.exclude === 'string' ? [config.exclude] : config.exclude ?? []
	const patterns = include.concat(exclude.map((pattern) => `!${pattern}`))

	async function loadPosts(ctx: PluginContext, dir: string) {
		const paths = await doGlob(dir)
		if (paths.length === 0) return null
		// eslint-disable-next-line consistent-return
		const contents = await Promise.all(
			paths.map(async (p) => {
				const code = await fs.readFile(p, { encoding: 'utf-8' })
				const ext = path.extname(p)
				const convert =
					converters[path.extname(p)] ??
					ctx.error({
						id: p,
						message: `No converter for ${ext} registered`,
					})
				try {
					return convert(code)
				} catch (eOrig) {
					let e: Error
					if (eOrig instanceof ParseError) {
						e = eOrig
						e.message = `Error parsing ${ext} file: ${eOrig.orig.message}`
					} else if (eOrig instanceof ASTError) {
						e = eOrig
						e.message = `Error converting the ${ext} AST: ${eOrig.message}`
					} else {
						// eslint-disable-next-line @typescript-eslint/no-base-to-string
						e = eOrig instanceof Error ? eOrig : new Error((eOrig as object).toString())
						e.message = `Unexpected error parsing or converting ${ext} file: ${e.message}`
					}
					;(e as Error & { id: string }).id = p // TODO: why?
					ctx.error(e)
				}
			}),
		)

		const map = zipObject(
			paths.map((p) => path.basename(p)),
			contents,
		)
		for (const [p, content] of Object.entries(map)) {
			if (!content) {
				console.log(`Skipped ${p}`)
				delete map[p]
			} else if (content.metadata['draft']) {
				console.log(`Skipped ${p} (“${content.title}” is a draft)`)
				delete map[p]
			}
		}
		return map
	}

	async function createCode(ctx: PluginContext, id: string): Promise<string | null> {
		const map = await loadPosts(ctx, id)
		if (map === null) return null

		const code = `export default ${JSON.stringify(map)}`
		const magicString = new MagicString(code)
		const ast = ctx.parse(code) as Node
		const imports = new Map<string, string>()

		// TODO: image
		const types = new Set([Type.Plotly])

		await asyncWalk(ast, {
			async enter(node) {
				if (node.type === 'ObjectExpression') {
					// Set.has should have type `(any) => bool`
					if (!types.has(getVal(getProp(node, 'type')) as Type)) return
					const urlProp = getProp(node, 'url')!
					const url = getVal(urlProp) as string
					const resolved = await ctx.resolve(url)
					if (!resolved) ctx.error(`cannot resolve “${url}” from “${id}”`)
					if (!imports.has(resolved.id)) {
						imports.set(resolved.id, `$${imports.size}`)
					}
					const urlVal = urlProp.value as AcornNode
					magicString.overwrite(urlVal.start, urlVal.end, imports.get(resolved.id)!)
				}
			},
		})

		const importBlock = Array.from(imports.entries())
			.map(([p, name]) => `import ${name} from ${JSON.stringify(`${p}?url`)}`)
			.join('\n')
		return `${importBlock}\n${magicString.toString()}`
	}

	async function doGlob(id: string): Promise<string[]> {
		const isDir = await fs
			.stat(id)
			.then((s) => s.isDirectory())
			.catch(() => false)
		if (!isDir) return []
		const paths = await globby(patterns, { cwd: id, absolute: true })
		return paths
	}

	return {
		name: 'renderdoc',
		async resolveId(id: string, importer?: string) {
			if (!id.startsWith('./') && !id.startsWith('../')) return null
			const rel = importer === undefined ? id : path.join(path.dirname(importer), id)
			if ((await doGlob(rel)).length === 0) return null
			return `${rel}/__renderdoc`
		},
		async load(id: string) {
			if (!id.endsWith('/__renderdoc')) return null
			const dir = path.dirname(id)
			const paths = await doGlob(dir)
			for (const p of paths) this.addWatchFile(p)
			return createCode(this, dir)
		},
		configureServer(server) {
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			server.middlewares.use(async (req, res, next) => {
				if (!req.url?.endsWith('__renderdoc')) {
					next()
					return
				}
				const { default: posts = null } = await server.ssrLoadModule(`.${req.url}`)
				if (posts === null) throw new Error(`${req.url} not found from ${cwd()}`)
				res.setHeader('Content-Type', 'application/javascript')
				res.end(`export default ${JSON.stringify(posts, undefined, '\t')}`)
			})
		},
	}
}

export default renderdoc
