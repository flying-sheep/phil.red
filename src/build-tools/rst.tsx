/** @jsxImportSource ../markup */

import type { PyProxyWithGet, PySequence } from 'pyodide/ffi'
import ASTError from '../markup/ASTError'
import * as m from '../markup/MarkupDocument'
import * as docutils from './pyiodide-docutils'

type RSTNode = PyProxyWithGet

/*
interface Directive {
	header: string | null
	params: { [k: string]: string }
	body: string[]
}

function parseDirective(lines: m.Node[]): Directive {
	const texts = lines.map((n) =>
		n.type === 'text' ? n.value : JSON.stringify(n),
	)
	const [header = null, ...rest] = texts
	let lastParam = -1
	const params = rest
		.filter((line, i) => {
			if (i > lastParam + 1) return false // there have been non-params
			if (!/^:\w+:\s/.test(line)) return false
			lastParam = i + 1
			return true
		})
		.reduce<{ [k: string]: string }>((obj, line) => {
			const [, name, val] = /^:(\w+):\s(.*)+/.exec(line) as unknown as [
				string,
				string,
				string,
			]
			obj[name] = val
			return obj
		}, {})
	const body = rest.slice(lastParam + 1)
	return { header, params, body }
}
*/

function pos(node: RSTNode): m.Position | undefined {
	const line: number | undefined = node['line']
	return line === undefined ? undefined : { line: line + 1, column: 1 }
}

function convertNode(node: RSTNode, level: number): m.Node[] {
	switch (node?.['tagname']) {
		// https://sphinx-docutils.readthedocs.io/en/latest/docutils.nodes.html#docutils.nodes.target
		case 'target': // already resolved
		// https://sphinx-docutils.readthedocs.io/en/latest/docutils.nodes.html#docutils.nodes.docinfo
		case 'docinfo': // handled in getMeta
		// https://sphinx-docutils.readthedocs.io/en/latest/docutils.nodes.html#docutils.nodes.comment
		case 'comment':
			return []
		// https://sphinx-docutils.readthedocs.io/en/latest/docutils.nodes.html#docutils.nodes.footnote
		case 'footnote': {
			// TODO: validate that it exists and has tagname "label"
			const label = convertChildren(node['children'][0], level)
			return [
				// TODO: anchor from node['ids'], backlink to footnote_reference using node["backrefs"]
				<m.EnumList pos={pos(node)} start={Number(node.get('names')[0])}>
					<m.ListItem pos={pos(node)}>{label}</m.ListItem>
				</m.EnumList>,
			]
		}
		// https://sphinx-docutils.readthedocs.io/en/latest/docutils.nodes.html#docutils.nodes.reference
		case 'reference':
		// https://sphinx-docutils.readthedocs.io/en/latest/docutils.nodes.html#docutils.nodes.footnote_reference
		case 'footnote_reference': {
			const children = convertChildren(node, level)

			// TODO: allow backlinks with node['ids']
			return [
				<m.Link ref={{ name: node.get('refid') }} pos={pos(node)}>
					{node['tagname'] === 'footnote_reference' ? (
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
					{convertChildren(node, level + 1)}
				</m.Section>,
			]
		case 'title': {
			if (level < 1)
				throw new ASTError(`Header with level ${level} < 1`, node, pos(node))
			const hLevel = Math.min(level, 6)
			const { anchor } = node['parent'].get('ids')[0] // 'ids' is slugified, 'names' literal
			return [
				<m.Title level={hLevel} anchor={anchor} pos={pos(node)}>
					{convertChildren(node, level)}
				</m.Title>,
			]
		}
		case 'paragraph':
			return [
				<m.Paragraph pos={pos(node)}>
					{convertChildren(node, level)}
				</m.Paragraph>,
			]
		case 'block_quote':
			return [
				<m.BlockQuote pos={pos(node)}>
					{convertChildren(node, level)}
				</m.BlockQuote>,
			]
		case undefined:
			return [node.toString()]
		case 'literal':
			return [<m.Code pos={pos(node)}>{convertChildren(node, level)}</m.Code>]
		case 'emphasis':
			return [<m.Emph pos={pos(node)}>{convertChildren(node, level)}</m.Emph>]
		case 'strong':
			return [
				<m.Strong pos={pos(node)}>{convertChildren(node, level)}</m.Strong>,
			]
		case 'bullet_list': {
			// TODO: convert some known bullets
			return [
				<m.BulletList
					bullet={m.Bullet.text}
					text={node.get('bullet')}
					pos={pos(node)}
				>
					{convertChildren(node, level)}
				</m.BulletList>,
			]
		}
		case 'enumerated_list':
			return [
				<m.EnumList pos={pos(node)}>{convertChildren(node, level)}</m.EnumList>,
			]
		case 'list_item':
			return [
				<m.ListItem pos={pos(node)}>{convertChildren(node, level)}</m.ListItem>,
			]
		case 'definition_list':
			return [
				<m.DefList pos={pos(node)}>{convertChildren(node, level)}</m.DefList>,
			]
		case 'definition_list_item':
			return [
				<m.DefItem pos={pos(node)}>{convertChildren(node, level)}</m.DefItem>,
			]
		case 'term':
			return [
				<m.DefTerm pos={pos(node)}>{convertChildren(node, level)}</m.DefTerm>,
			]
		case 'definition':
			return [<m.Def pos={pos(node)}>{convertChildren(node, level)}</m.Def>]
		/*
		case 'interpreted_text':
			switch (node.role) {
				case 'math':
					return [
						<m.InlineMath
							math={node.children
								.map((text) => (text as RSTInlineNode).value)
								.join('')}
							pos={pos(node)}
						/>,
					]
				case 'pep': {
					const num = node.children
						.map((text) => (text as RSTInlineNode).value)
						.join('')
					const href = `https://www.python.org/dev/peps/pep-${num.padStart(4, '0')}/`
					return [
						<m.Link ref={{ href }} pos={pos(node)}>{`PEP ${num}`}</m.Link>,
					]
				}
				case null:
					return [
						<m.Emph pos={pos(node)}>{convertChildren(node, level)}</m.Emph>,
					]
				default:
					throw new ASTError(`Unknown role “${node.role}”`, node, pos(node))
			}
		*/
		case 'literal_block':
			return [<m.CodeBlock pos={pos(node)}>{node['astext']()}</m.CodeBlock>]
		/*
		case 'directive': {
			const directive = node.directive as rst.DirectiveType | 'plotly'
			switch (directive) {
				case 'epigraph':
				case 'highlights':
				case 'pull-quote': {
					const parsed = rstConvertInner(
						node.children
							.map((n) => (n as rst.InlineNode<true>).value)
							.join('\n'),
					)
					return [
						<m.BlockQuote pos={pos(node)} variant={directive}>
							{convertNode(parsed, level)}
						</m.BlockQuote>,
					]
				}
				case 'code-block':
				case 'code': {
					const { header, body } = parseDirective(node.children)
					// TODO: check if in lang dict
					return [
						<m.CodeBlock language={header ?? undefined} pos={pos(node)}>
							{body}
						</m.CodeBlock>,
					]
				}
			}
		}
		*/
		case 'table': {
			const children: [RSTNode, ...RSTNode[]] = node['children'].values()
			const [title, ...groups] =
				children[0]['tagname'] === 'title' ? children : [null, ...children]
			return [
				// https://docutils.sourceforge.io/docs/ref/doctree.html#tgroup
				<m.Table caption={title?.['astext']()} pos={pos(node)}>
					{groups.flatMap((group) => convertChildren(group, level))}
				</m.Table>,
			]
		}
		case 'colspec':
		case 'thead':
			return []
		case 'tbody':
			return convertChildren(node, level)
		case 'row':
			return [<m.Row pos={pos(node)}>{convertChildren(node, level)}</m.Row>]
		case 'entry':
			return [<m.Cell pos={pos(node)}>{convertChildren(node, level)}</m.Cell>]
		case 'plotly': {
			return [
				<m.Plotly
					url={node.get('url')}
					onClickLink={node.get('href')}
					style={{ width: '100%' }}
					config={{ responsive: true }}
					pos={pos(node)}
				/>,
			]
		}
		default:
			throw new ASTError(
				`Unknown node type: ${node.toString()}`,
				node,
				pos(node),
			)
	}
}

function convertChildren(node: RSTNode, level: number): m.Node[] {
	return ((node?.['children'] as PySequence) ?? []).reduce(
		(ns: m.Node[], n: RSTNode) => ns.concat(convertNode(n, level)),
		[],
	)
}

/*
function innerText(node: RSTNode): string {
	return 'value' in node ? node.value : node.children.map(innerText).join('')
}

function titleAnchor(node: RSTNode): { name: string; anchor: string } {
	return anchor(innerText(node))
}

function* extractTargetsInner(
	node: RSTNode,
): IterableIterator<[string, string]> {
	for (const child of 'children' in node ? node.children : []) {
		if (typeof child === 'string') continue
		if (child.type === 'title') {
			const { name, anchor } = titleAnchor(child)
			yield [name, `#${anchor}`]
		} else if (child.type === 'comment') {
			const comment = (child.children as [RSTInlineNode])[0].value

			{
				// normal reference
				const [, name = null, href = null] =
					/^_([^:]+):\s+(.+)$/.exec(comment) ?? []
				// TODO: “_`name with backticks`: ...”
				if (name !== null && href !== null) {
					yield [name.toLocaleLowerCase(), href]
				}
			}

			{
				// footnote reference
				const [name, text] = parseCommentAsFootnote(comment)
				if (name !== null && text !== null) {
					const ref = `footnote-${name.toLocaleLowerCase()}`
					yield [ref, `#${ref}`]
				}
			}
		} else if ('children' in child) {
			yield* extractTargetsInner(child)
		}
	}
}

function parseCommentAsFootnote(
	comment: string,
): [string | null, string | null] {
	const [, name = null, text = null] =
		/^\[([^\]]+)\]\s+(.+)$/.exec(comment) ?? []
	return [name, text]
}

const URL_SCHEMA = /^https?:.*$/
const ANCHOR_SCHEMA = /^#.*$/

function extractTargets(node: RSTNode): { [key: string]: string } {
	const pending = Object.fromEntries(extractTargetsInner(node))
	const resolved: { [key: string]: string } = {}
	let newResolvable = true
	while (newResolvable) {
		newResolvable = false
		for (const [k, maybeV] of Object.entries(pending)) {
			const v = resolved[maybeV] ?? maybeV // if so the match will be true
			// TODO: more schemas
			if (v.match(URL_SCHEMA) ?? v.match(ANCHOR_SCHEMA)) {
				resolved[k] = v
				delete pending[k]
				newResolvable = true
			}
		}
	}
	if (Object.keys(pending).length) {
		console.warn('Could not resolve references: %s', pending)
	}
	return resolved
}

function resolveTargets(
	nodes: m.Node[],
	targets: { [key: string]: string },
): m.Node[] {
	return nodes.map((node) => {
		if (typeof node === 'string') return node
		const elem = { ...node }
		if (elem.type === m.Type.Link && 'name' in elem.ref) {
			const maybeHref = targets[elem.ref.name.toLocaleLowerCase()]
			if (maybeHref) {
				elem.ref = { href: maybeHref }
			} else {
				// maybe inline syntax
				const [, text, href] =
					/^(.+?)\s*<([a-z]+:[^<>]+)>/.exec(elem.ref.name) ?? []
				if (text && href) {
					elem.ref = { href }
					elem.children = [text]
				} else {
					console.warn(`Unmatched link target ${elem.ref.name}`)
				}
			}
		}
		elem.children = resolveTargets(elem.children, targets)
		return elem
	})
}
*/

function getMeta(document: RSTNode): { [key: string]: string } {
	// TODO: https://github.com/microsoft/TypeScript/issues/54966
	const docinfo = document['children'][0]
	const meta: { [key: string]: string } = {}
	if (docinfo['tagname'] !== 'docinfo') return meta
	for (const field of docinfo['children']) {
		const [name, value] = field['children'] as [RSTNode, RSTNode]
		meta[name['astext']()] = value['astext']()
	}
	return meta
}

export default async function rstConvert(
	code: string,
	path?: string,
): Promise<m.Document> {
	const { core } = await docutils.load()
	const document: RSTNode = await docutils.publish(code, path, core)
	const children = convertChildren(document, 1)
	const metadata = getMeta(document)
	return { title: document['title'], children, metadata }
}
