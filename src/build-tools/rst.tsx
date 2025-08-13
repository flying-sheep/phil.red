/** @jsxImportSource ../markup */

import type { PyProxy, PySequence } from 'pyodide/ffi'
import ASTError from '../markup/ASTError'
import * as m from '../markup/MarkupDocument'
import * as docutils from './pyiodide-docutils'

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

function pos(node: PyProxy): m.Position | undefined {
	const { line } = node
	return line === undefined ? undefined : { line, column: undefined }
}

function convertNode(node: PyProxy, level: number): m.Node[] {
	console.log(level)
	switch (node?.['tagname']) {
		case 'paragraph':
			return [
				{
					type: m.Type.Paragraph,
					children: node['children'].map(convertNode),
					pos: pos(node),
				},
			]
		case 'literal':
			return [
				{
					type: m.Type.Code,
					children: node['children'].map(convertNode),
					pos: pos(node),
				},
			]
		case undefined:
			return [node.toString()]
		/*
		case 'document':
			return convertChildren(node, level)
		case 'comment': {
			const comment = (node.children as [RSTNode])[0].value

			const [name, text] = parseCommentAsFootnote(comment)
			if (name !== null && text !== null) {
				return [
					// TODO: anchor
					<m.EnumList pos={pos(node)} start={Number(name)}>
						<m.ListItem pos={pos(node)}>{text}</m.ListItem>
					</m.EnumList>,
				]
			}
			return []
		}
		case 'reference':
		case 'footnote_reference': {
			const text = (node.children[0] as RSTNode).value
			const [name, label] =
				node.type === 'footnote_reference'
					? [
							`footnote-${text}`,
							<m.Superscript pos={pos(node)}>{text}</m.Superscript>,
						]
					: [text, text]
			return [
				<m.Link ref={{ name }} pos={pos(node)}>
					{label}
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
			const { anchor } = titleAnchor(node)
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
		case 'text': {
			const fieldList = /^:((?:\\:|[^:])+):\s+(.*)/.exec(node.value)
			if (!fieldList) return [node.value]
			const [, fieldName, fieldValue] = fieldList as unknown as [
				string,
				string,
				string,
			]
			return [
				// TODO: convert runs to single lists, not multiple
				<m.FieldList pos={pos(node)}>
					{
						(
							<m.Field name={fieldName} pos={pos(node)}>
								{fieldValue.trim()}
							</m.Field>
						) as m.Field
					}
				</m.FieldList>,
			]
		}
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
				<m.BulletList bullet={m.Bullet.text} text={node.bullet} pos={pos(node)}>
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
		case 'literal_block': {
			const texts = node.children.map((n) =>
				n.type === 'text' ? n.value : JSON.stringify(n),
			)
			return [<m.CodeBlock pos={pos(node)}>{texts.join('\n')}</m.CodeBlock>]
		}
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
				case 'csv-table': {
					const { header, params, body } = parseDirective(node.children)
					const delim = (() => {
						switch (params['delim']) {
							case 'tab':
								return '\t'
							case 'space':
								return ' '
							default:
								return params['delim'] ?? ','
						}
					})()
					return [
						<m.Table caption={header ?? undefined} pos={pos(node)}>
							{body.map((r) => (
								<m.Row pos={pos(node)}>
									{r.split(delim).map((cell) => (
										<m.Cell pos={pos(node)}>{cell}</m.Cell>
									))}
								</m.Row>
							))}
						</m.Table>,
					]
				}
				// custom
				case 'plotly': {
					const { header, params } = parseDirective(node.children)
					return [
						<m.Plotly
							url={header ?? ''}
							onClickLink={params['onClickLink']}
							style={{ width: '100%' }}
							config={{ responsive: true }}
							pos={pos(node)}
						/>,
					]
				}
				default:
					throw new ASTError(
						`Unknown directive “${node.directive}”`,
						node,
						pos(node),
					)
			}
		}
		*/
		default:
			throw new ASTError(
				`Unknown node type “${node?.['tagname']}”`,
				node,
				pos(node),
			)
	}
}

/*
function convertChildren(node: RSTNode, level: number): m.Node[] {
	return ('children' in node ? node.children : []).reduce(
		(ns: m.Node[], n: RSTNode) => ns.concat(convertNode(n, level)),
		[],
	)
}

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

function getTitle(body: m.Node[]): string {
	if (body.length === 0) throw new ASTError('Empty body', undefined)
	const section = body[0]
	if (typeof section === 'string')
		throw new ASTError(`Body starts with string: ${section}`, section)
	if (!section || section.type !== m.Type.Section)
		throw new ASTError('No section!', section, section?.pos)
	if (section.children.length === 0)
		throw new ASTError('Empty Section', section, section.pos)
	const title = section.children[0]
	if (typeof title === 'string')
		throw new ASTError(`Section starts with string: ${title}`, section.pos)
	if (!title || title.type !== m.Type.Title)
		throw new ASTError('No title!', title, title?.pos ?? section.pos)
	const text = title.children[0]
	if (typeof text !== 'string')
		throw new ASTError('Empty title!', title, title.pos)
	return text.trim()
}

function getMeta(fieldLists: m.Elem) {
	// TODO: https://github.com/microsoft/TypeScript/issues/54966
	return Object.fromEntries(
		fieldLists.children
			.filter(
				(n: m.Node): n is m.FieldList =>
					typeof n !== 'string' && n.type === m.Type.FieldList,
			)
			.flatMap((fl) => (fl as m.FieldList).children)
			.map((f) => [f.name, f.children[0]?.toString()]),
	)
}
*/

export default async function rstConvert(code: string): Promise<m.Document> {
	const children = await rstConvertInner(code)
	return { title: '', children, metadata: {} }
	/*const targets = extractTargets(parsed)
	const children = resolveTargets(convertNode(parsed, 0), targets)

	const metadata =
		(children[0] as m.Elem).type === m.Type.Section
			? {}
			: getMeta(children.shift() as m.Elem)

	return { title: getTitle(children), children, metadata }*/
}

async function rstConvertInner(code: string): Promise<m.Node[]> {
	const { core } = await docutils.load()
	const children: PySequence = (await docutils.publish(code, core))['children']
	// biome-ignore lint/complexity/useFlatMap: PySequence doesn’t have it
	return children.map(convertNode).flat()
}
