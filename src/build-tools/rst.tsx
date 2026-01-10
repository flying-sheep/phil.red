/** @jsxImportSource ../markup */

import temml from 'temml'
import type { VisualizationSpec } from 'vega-embed'
import ASTError from '../markup/ASTError'
import * as m from '../markup/MarkupDocument'
import highlightCode from './highlight'
import * as docutils from './pyiodide-docutils'
import type { ConverterOptions } from './rollup-plugin-renderdoc'

function pos(node: docutils.Node): m.Position | undefined {
	const line: number | undefined = node['line']
	return line === undefined ? undefined : { line: line + 1, column: 1 }
}

class RSTConverter {
	console: {
		debug: (msg: string) => void
		info: (msg: string) => void
		warn: (msg: string) => void
	}

	constructor(opts: ConverterOptions) {
		this.console = opts.ctx ?? console
	}

	async convertNode(node: docutils.Node, level: number): Promise<m.Node[]> {
		switch (node?.tagname) {
			// already resolved
			case 'target':
			case 'substitution_definition':
			// https://sphinx-docutils.readthedocs.io/en/latest/docutils.nodes.html#docutils.nodes.docinfo
			case 'docinfo': // handled in getMeta
			// https://sphinx-docutils.readthedocs.io/en/latest/docutils.nodes.html#docutils.nodes.comment
			case 'comment':
				return []
			// https://sphinx-docutils.readthedocs.io/en/latest/docutils.nodes.html#docutils.nodes.footnote
			case 'footnote': {
				// TODO: validate that it exists and has tagname "label"
				const [labelNode, ...content]: docutils.Node[] = Array.from(
					(node as docutils.Element).children.values(),
				)
				const anchor = node.get('ids')[0]
				const backrefs = [...node.get('backrefs')]
				const label = labelNode?.astext() ?? '???'
				const contents = (
					await Promise.all(content.map((n) => this.convertNode(n, level)))
				).flat()
				return [
					<m.FootNote
						pos={pos(node)}
						anchor={anchor}
						label={label}
						backrefs={backrefs}
					>
						{contents}
					</m.FootNote>,
				]
			}
			// https://sphinx-docutils.readthedocs.io/en/latest/docutils.nodes.html#docutils.nodes.reference
			case 'reference':
			// https://sphinx-docutils.readthedocs.io/en/latest/docutils.nodes.html#docutils.nodes.title_reference
			case 'title_reference':
			// https://sphinx-docutils.readthedocs.io/en/latest/docutils.nodes.html#docutils.nodes.footnote_reference
			case 'footnote_reference': {
				const children = await this.convertChildren(
					node as docutils.Element,
					level,
				)
				const anchor = node.get('ids')[0]
				const href = node.get('refuri') ?? `#${node.get('refid')}`
				return [
					<m.Link anchor={anchor} ref={{ href }} pos={pos(node)}>
						{node.tagname === 'footnote_reference' ? (
							<m.Superscript pos={pos(node)}>{children}</m.Superscript>
						) : (
							children
						)}
					</m.Link>,
				]
			}
			case 'section':
				return [
					<m.Section pos={pos(node)}>
						{await this.convertChildren(node as docutils.Element, level + 1)}
					</m.Section>,
				]
			case 'title': {
				if (level < 1)
					throw new ASTError(`Header with level ${level} < 1`, node, pos(node))
				const hLevel = Math.min(level, 6)
				const anchor = node.parent?.get('ids')[0] // 'ids' is slugified, 'names' literal
				return [
					<m.Title level={hLevel} anchor={anchor} pos={pos(node)}>
						{await this.convertChildren(node as docutils.Element, level)}
					</m.Title>,
				]
			}
			case 'paragraph':
				return [
					<m.Paragraph pos={pos(node)}>
						{await this.convertChildren(node as docutils.Element, level)}
					</m.Paragraph>,
				]
			case 'block_quote': {
				const variant = node
					.get('classes')
					.find((v: string) => m.BlockQuote.VARIANTS.has(v))
				return [
					<m.BlockQuote variant={variant} pos={pos(node)}>
						{await this.convertChildren(node as docutils.Element, level)}
					</m.BlockQuote>,
				]
			}
			case undefined:
				return [node.toString().replace(/\0.*/s, '')]
			case 'literal':
				return [
					<m.Code pos={pos(node)}>
						{await this.convertChildren(node as docutils.Element, level)}
					</m.Code>,
				]
			case 'emphasis':
				return [
					<m.Emph pos={pos(node)}>
						{await this.convertChildren(node as docutils.Element, level)}
					</m.Emph>,
				]
			case 'strong':
				return [
					<m.Strong pos={pos(node)}>
						{await this.convertChildren(node as docutils.Element, level)}
					</m.Strong>,
				]
			case 'bullet_list': {
				// TODO: convert some known bullets
				return [
					<m.BulletList
						bullet={m.Bullet.text}
						text={node.get('bullet')}
						pos={pos(node)}
					>
						{await this.convertChildren(node as docutils.Element, level)}
					</m.BulletList>,
				]
			}
			case 'enumerated_list':
				return [
					<m.EnumList pos={pos(node)}>
						{await this.convertChildren(node as docutils.Element, level)}
					</m.EnumList>,
				]
			case 'list_item':
				return [
					<m.ListItem pos={pos(node)}>
						{await this.convertChildren(node as docutils.Element, level)}
					</m.ListItem>,
				]
			case 'definition_list':
				return [
					<m.DefList pos={pos(node)}>
						{await this.convertChildren(node as docutils.Element, level)}
					</m.DefList>,
				]
			case 'definition_list_item':
				return [
					<m.DefItem pos={pos(node)}>
						{await this.convertChildren(node as docutils.Element, level)}
					</m.DefItem>,
				]
			case 'term':
				return [
					<m.DefTerm pos={pos(node)}>
						{await this.convertChildren(node as docutils.Element, level)}
					</m.DefTerm>,
				]
			case 'definition':
				return [
					<m.Def pos={pos(node)}>
						{await this.convertChildren(node as docutils.Element, level)}
					</m.Def>,
				]
			case 'math': {
				const math = node.astext()
				return [
					<m.InlineMath math={temml.renderToString(math)} pos={pos(node)} />,
				]
			}
			case 'literal_block': {
				const lang = Array.from<string>(node.get('classes')).find(
					(c) => c !== 'code',
				)
				const code = node.astext()
				const parsed = lang ? await highlightCode(code, lang) : undefined
				return [
					<m.CodeBlock language={lang} parsed={parsed} pos={pos(node)}>
						{[code]}
					</m.CodeBlock>,
				]
			}
			case 'table': {
				const groups: docutils.Node[] = Array.from(
					(node as docutils.Element).children.values(),
				)
				const title = groups[0]?.tagname === 'title' ? groups.shift() : null
				const rows = await Promise.all(
					groups.map((g) => this.convertChildren(g as docutils.Element, level)),
				)
				return [
					// https://docutils.sourceforge.io/docs/ref/doctree.html#tgroup
					<m.Table caption={title?.astext()} pos={pos(node)}>
						{rows.flat()}
					</m.Table>,
				]
			}
			case 'colspec':
			case 'thead':
				return []
			case 'tbody':
				return this.convertChildren(node as docutils.Element, level)
			case 'row':
				return [
					<m.Row pos={pos(node)}>
						{await this.convertChildren(node as docutils.Element, level)}
					</m.Row>,
				]
			case 'entry':
				return [
					<m.Cell pos={pos(node)}>
						{await this.convertChildren(node as docutils.Element, level)}
					</m.Cell>,
				]
			case 'vega':
				return [
					<m.Vega
						spec={JSON.parse(node['rawsource'].toString()) as VisualizationSpec}
						pos={pos(node)}
					/>,
				]
			case 'problematic':
				return [<m.Problematic pos={pos(node)}>{node.astext()}</m.Problematic>]
			// https://docutils.sourceforge.io/docs/ref/doctree.html#system-message
			case 'system_message':
				switch (Number(node.get('level'))) {
					case 0:
						this.console.debug(node.astext())
						return []
					case 1:
						this.console.info(node.astext())
						return []
					case 2:
						this.console.warn(node.astext())
						return []
					case 3:
					case 4:
						throw new ASTError(node.astext(), node, {
							line: Number(node.get('line')) + 1,
							column: 1,
						})
					default:
						throw new Error(
							`Unknown system message level: ${node.get('level')}`,
						)
				}
			default:
				throw new ASTError(
					`Unknown node type: ${node.toString()}`,
					node,
					pos(node),
				)
		}
	}

	async convertChildren(
		elem: docutils.Element,
		level: number,
	): Promise<m.Node[]> {
		const nodes = await Promise.all(
			elem.children.map((n) => this.convertNode(n, level)),
		)
		return nodes.flat()
	}

	getMeta(document: docutils.Element): { [key: string]: string } {
		// TODO: https://github.com/microsoft/TypeScript/issues/54966
		const docinfo = document.children.find(
			(n: docutils.Node) => n.tagname === 'docinfo',
		)
		const meta: { [key: string]: string } = {}
		if (docinfo === undefined) return meta
		for (const field of docinfo.children) {
			const [name, value] = field.children.values() as [
				docutils.Node,
				docutils.Node,
			]
			meta[name.astext()] = value.astext()
		}
		return meta
	}
}

export default async function rstConvert(
	code: string,
	opts: ConverterOptions = {},
): Promise<m.Document> {
	const { core } = await docutils.load()
	const document = await docutils.publish(code, opts.path, core)
	const conv = new RSTConverter(opts)
	const children = await conv.convertChildren(document, 1)
	const metadata = conv.getMeta(document)
	return { title: document.get('title'), children, metadata }
}
