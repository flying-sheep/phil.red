import { promises as fs } from 'node:fs'
import * as path from 'node:path'

import type { Node, ObjectExpression, Property } from 'estree'
import { asyncWalk } from 'estree-walker'
import { globby } from 'globby'
import MagicString from 'magic-string'
import type { AstNode, PluginContext } from 'rollup'
import type { Plugin } from 'vite'

import { ASTError, type Document, ParseError, Type } from '../markup'

import mdConvert from './md'
import rstConvert from './rst'

function getProp(node: ObjectExpression, key: string): Property | undefined {
	for (const prop of node.properties) {
		if (
			prop.type === 'Property' &&
			prop.key.type === 'Literal' &&
			prop.key.value === key
		) {
			return prop
		}
	}
	return undefined
}

function getVal(prop: Property | undefined) {
	if (prop?.type !== 'Property' || prop.value.type !== 'Literal')
		return undefined
	return prop.value.value
}

export interface ConverterOptions {
	path?: string
	ctx?: {
		debug(msg: string): void
		info(msg: string): void
		warn(msg: string): void
	}
}

export type Converter = (
	source: string,
	opts?: ConverterOptions,
) => Document | Promise<Document>

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
	const exts = new Set(Object.keys(converters))
	const include: string[] =
		typeof config.include === 'string'
			? [config.include]
			: (config.include ?? [])
	const exclude: string[] =
		typeof config.exclude === 'string'
			? [config.exclude]
			: (config.exclude ?? [])
	const patterns = include.concat(exclude.map((pattern) => `!${pattern}`))

	async function loadPost(ctx: PluginContext, id: string) {
		const code = await fs.readFile(id, { encoding: 'utf-8' })
		const ext = path.extname(id)
		const convert =
			converters[path.extname(id)] ??
			ctx.error({
				id: id,
				message: `No converter for ${ext} registered`,
			})
		try {
			return await convert(code, { path: id, ctx })
		} catch (eOrig) {
			let e: Error
			if (eOrig instanceof ParseError) {
				e = eOrig
				e.message = `Error parsing ${ext} file: ${eOrig.orig.message}`
			} else if (eOrig instanceof ASTError) {
				e = eOrig
				e.message = `Error converting the ${ext} AST: ${eOrig.message}`
			} else {
				e =
					eOrig instanceof Error
						? eOrig
						: new Error((eOrig as object).toString())
				e.message = `Unexpected error parsing or converting ${ext} file: ${e.message}`
			}
			;(e as Error & { id: string }).id = id // TODO: why?
			ctx.error(e)
		}
	}

	async function createCode(ctx: PluginContext, id: string): Promise<string> {
		const post = await loadPost(ctx, id)
		if (post.metadata['draft']) {
			ctx.info(`skipping draft “${id}”`)
			return 'export default null'
		}
		const code = `export default ${JSON.stringify(post)}`
		const magicString = new MagicString(code)
		const ast = ctx.parse(code) as Node
		const imports = new Map<string, string>()

		// TODO: image
		const types = new Set([Type.Vega])

		await asyncWalk(ast, {
			async enter(node) {
				if (node.type === 'ObjectExpression') {
					// Set.has should have type `(any) => bool`
					if (!types.has(getVal(getProp(node, 'type')) as Type)) return
					const specVal = getProp(node, 'spec')?.value
					if (!specVal || specVal.type !== 'ObjectExpression')
						ctx.error(
							`missing “spec” object in “${id}”: ${JSON.stringify(node)}`,
						)
					const dataVal = getProp(specVal, 'data')?.value
					if (!dataVal || dataVal.type !== 'ObjectExpression')
						ctx.error(
							`missing “data” object in “${id}”: ${JSON.stringify(node)}`,
						)
					const urlProp = getProp(dataVal, 'url')
					if (!urlProp) ctx.error(`missing “url” in “${id}”`)
					const url = getVal(urlProp) as string
					const resolved = await ctx.resolve(url)
					if (!resolved) ctx.error(`cannot resolve “${url}” from “${id}”`)
					if (!imports.has(resolved.id)) {
						imports.set(resolved.id, `$${imports.size}`)
					}
					const urlVal = urlProp.value as AstNode
					magicString.overwrite(
						urlVal.start,
						urlVal.end,
						// biome-ignore lint/style/noNonNullAssertion: Is set above
						imports.get(resolved.id)!,
					)
				}
			},
		})

		const importBlock = Array.from(imports.entries())
			.map(([p, name]) => `import ${name} from ${JSON.stringify(`${p}?url`)}`)
			.join('\n')
		return `${importBlock}\n${magicString.toString()}`
	}

	async function createIndex(
		ctx: PluginContext,
		dir: string,
	): Promise<string | null> {
		const paths = await doGlob(dir)

		const imports = new Map<string, string>()
		for (const p of paths) {
			const resolved = await ctx.resolve(p)
			if (!resolved) ctx.error(`cannot resolve “${p}” from “${dir}”`)
			const id = path.relative(dir, resolved.id)
			if (!imports.has(id)) {
				imports.set(id, `$${imports.size}`)
			}
		}
		const importBlock = Array.from(imports.entries())
			.map(([p, name]) => `import ${name} from ${JSON.stringify(p)}`)
			.join('\n')
		const map = `{\n${Array.from(imports.entries())
			.map(([id, name]) => `\t${JSON.stringify(path.basename(id))}: ${name},\n`)
			.join('')}}`
		return `${importBlock}\nexport default ${map}`
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
			if (exts.has(path.extname(id))) return id
			if (id.startsWith('./') || !id.startsWith('../')) {
				const rel =
					importer === undefined ? id : path.join(path.dirname(importer), id)
				if ((await doGlob(rel)).length === 0) return null
				return `${rel}/__renderdoc`
			}
			return null
		},
		async load(id: string) {
			if (exts.has(path.extname(id))) {
				return createCode(this, id)
			}
			if (id.endsWith('/__renderdoc')) {
				const dir = path.dirname(id)
				return createIndex(this, dir)
			}
			return null
		},
	}
}

export default renderdoc
