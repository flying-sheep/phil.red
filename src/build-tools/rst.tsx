/** @jsxImportSource ../markup */

import { Language } from 'prism-react-renderer'
import * as rst from 'restructured'
import { SyntaxError } from 'restructured/lib/Parser.js'

import ASTError from '../markup/ASTError'
import * as m from '../markup/MarkupDocument'
import ParseError from '../markup/ParseError'

interface Directive {
	header: string | null
	params: { [k: string]: string }
	body: string[]
}

type RSTNode = rst.Node<true>
type RSTInlineNode = rst.InlineNode<true>

function parseDirective(lines: RSTNode[]): Directive {
	const texts = lines.map((n) => (n.type === 'text' ? n.value : JSON.stringify(n)))
	const [header = null, ...rest] = texts
	let lastParam = -1
	const params = rest
		.filter((line, i) => {
			if (i > lastParam + 1) return false // there have been non-params
			if (!/^:\w+:\s/.test(line)) return false
			lastParam = i + 1
			return true
		})
		.reduce((obj, line) => {
			const [, name, val] = /^:(\w+):\s(.*)+/.exec(line)!
			obj[name] = val // eslint-disable-line no-param-reassign
			return obj
		}, {} as { [k: string]: string })
	const body = rest.slice(lastParam + 1)
	return { header, params, body }
}

function pos(node: RSTNode) {
	return node.position.start
}

function convertNode(node: RSTNode, level: number): m.Node[] {
	switch (node.type) {
	case 'document':
		return convertChildren(node, level)
	case 'comment':
		return []
	case 'reference': {
		const name = (node.children[0] as RSTInlineNode).value
		return [<m.Link ref={{ name }} pos={pos(node)}>{name}</m.Link>]
	}
	case 'section':
		return [<m.Section pos={pos(node)}>{convertChildren(node, level + 1)}</m.Section>]
	case 'title': {
		if (level < 1) throw new ASTError(`Header with level ${level} < 1`, node, pos(node))
		const hLevel = Math.min(level, 6)
		const { anchor } = titleAnchor(node)
		return [
			<m.Title level={hLevel} anchor={anchor} pos={pos(node)}>
				{convertChildren(node, level)}
			</m.Title>,
		]
	}
	case 'paragraph':
		return [<m.Paragraph pos={pos(node)}>{convertChildren(node, level)}</m.Paragraph>]
	case 'block_quote':
		return [<m.BlockQuote pos={pos(node)}>{convertChildren(node, level)}</m.BlockQuote>]
	case 'text': {
		const fieldList = /^:((?:\\:|[^:])+):\s+(.*)/.exec(node.value)
		if (!fieldList) return [node.value]
		const [, fieldName, fieldValue] = fieldList
		return [ // TODO: convert runs to single lists, not multiple
			<m.FieldList pos={pos(node)}>
				<m.Field name={fieldName} pos={pos(node)}>{fieldValue.trim()}</m.Field>
			</m.FieldList>,
		]
	}
	case 'literal':
		return [<m.Code pos={pos(node)}>{convertChildren(node, level)}</m.Code>]
	case 'emphasis':
		return [<m.Emph pos={pos(node)}>{convertChildren(node, level)}</m.Emph>]
	case 'strong':
		return [<m.Strong pos={pos(node)}>{convertChildren(node, level)}</m.Strong>]
	case 'bullet_list': {
		// TODO: convert some known bullets
		return [
			<m.BulletList bullet={m.Bullet.text} text={node.bullet} pos={pos(node)}>
				{convertChildren(node, level)}
			</m.BulletList>,
		]
	}
	case 'enumerated_list':
		return [<m.EnumList pos={pos(node)}>{convertChildren(node, level)}</m.EnumList>]
	case 'list_item':
		return [<m.ListItem pos={pos(node)}>{convertChildren(node, level)}</m.ListItem>]
	case 'definition_list':
		return [<m.DefList pos={pos(node)}>{convertChildren(node, level)}</m.DefList>]
	case 'definition_list_item':
		return [<m.DefItem pos={pos(node)}>{convertChildren(node, level)}</m.DefItem>]
	case 'term':
		return [<m.DefTerm pos={pos(node)}>{convertChildren(node, level)}</m.DefTerm>]
	case 'definition':
		return [<m.Def pos={pos(node)}>{convertChildren(node, level)}</m.Def>]
	case 'interpreted_text':
		switch (node.role) {
		case 'math':
			return [<m.InlineMath math={node.children.map((text) => (text as RSTInlineNode).value).join('')} pos={pos(node)}/>]
		case 'pep': {
			const num = node.children.map((text) => (text as RSTInlineNode).value).join('')
			const href = `https://www.python.org/dev/peps/pep-${num.padStart(4, '0')}/`
			return [<m.Link ref={{ href }} pos={pos(node)}>{`PEP ${num}`}</m.Link>]
		}
		case null:
			return [<m.Emph pos={pos(node)}>{convertChildren(node, level)}</m.Emph>]
		default:
			throw new ASTError(`Unknown role “${node.role}”`, node, pos(node))
		}
	case 'literal_block': {
		const texts = node.children.map((n) => (n.type === 'text' ? n.value : JSON.stringify(n)))
		return [<m.CodeBlock pos={pos(node)}>{texts.join('\n')}</m.CodeBlock>]
	}
	case 'directive': {
		switch (node.directive as rst.DirectiveType | 'plotly') {
		case 'code-block':
		case 'code': {
			const { header, body } = parseDirective(node.children)
			// TODO: check if in lang dict
			return [
				<m.CodeBlock language={header as Language ?? undefined} pos={pos(node)}>
					{body}
				</m.CodeBlock>,
			]
		}
		case 'csv-table': {
			const { header, params, body } = parseDirective(node.children)
			const delim = (() => {
				switch (params.delim) {
				case 'tab': return '\t'
				case 'space': return ' '
				default: return params.delim
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
					onClickLink={params.onClickLink}
					style={{ width: '100%' }}
					config={{ responsive: true } as any} // typing has no responsive
					pos={pos(node)}
				/>,
			]
		}
		default:
			throw new ASTError(`Unknown directive “${node.directive}”`, node, pos(node))
		}
	}
	default:
		throw new ASTError(`Unknown node type “${(node as RSTNode).type}”`, node, pos(node))
	}
}

function convertChildren(node: RSTNode, level: number): m.Node[] {
	return ('children' in node ? node.children : []).reduce(
		(ns: m.Node[], n: RSTNode) => [...ns, ...convertNode(n, level)],
		[],
	)
}

function innerText(node: RSTNode): string {
	return 'value' in node ? node.value : node.children.map(innerText).join('')
}

function titleAnchor(node: RSTNode) {
	const name = innerText(node).toLocaleLowerCase()
	const anchor = name.replace(' ', '-')
	return { name, anchor }
}

function* extractTargetsInner(node: RSTNode): IterableIterator<[string, string]> {
	for (const child of 'children' in node ? node.children : []) {
		if (typeof child === 'string') continue
		if (child.type === 'title') {
			const { name, anchor } = titleAnchor(child)
			yield [name, `#${anchor}`]
		} else if (child.type === 'comment') {
			const comment = (child.children as [RSTInlineNode])[0].value
			const [, name = null, href = null] = /^_([^:]+):\s+(.+)$/.exec(comment) ?? []
			// TODO: “_`name with backticks`: ...”
			if (name !== null && href !== null) yield [name.toLocaleLowerCase(), href]
		} else if ('children' in child) {
			yield* extractTargetsInner(child)
		}
	}
}

const URL_SCHEMA = /^https?:.*$/
const ANCHOR_SCHEMA = /^#.*$/

function extractTargets(node: RSTNode): {[key: string]: string} {
	const pending = Object.fromEntries(extractTargetsInner(node))
	const resolved: {[key: string]: string} = {}
	let newResolvable = true
	while (newResolvable) {
		newResolvable = false
		for (const entry of Object.entries(pending)) {
			const k = entry[0]
			const v = entry[1] in resolved ? resolved[entry[1]] : entry[1] // if so the match will be true
			// TODO: more schemas
			if (v.match(URL_SCHEMA) ?? v.match(ANCHOR_SCHEMA)) {
				resolved[k] = v
				delete pending[k]
				newResolvable = true
			}
		}
	}
	if (Object.keys(pending).length) {
		// eslint-disable-next-line no-console
		console.warn('Could not resolve references: %s', pending)
	}
	return resolved
}

function resolveTargets(nodes: m.Node[], targets: {[key: string]: string}): m.Node[] {
	return nodes.map((node) => {
		if (typeof node === 'string') return node
		const elem = { ...node }
		if (elem.type === m.Type.Link && 'name' in elem.ref) {
			if (elem.ref.name.toLocaleLowerCase() in targets) {
				elem.ref = { href: targets[elem.ref.name.toLocaleLowerCase()] }
			} else { // maybe inline syntax
				const [, text = null, href = null] = /^(.+?)\s*<([a-z]+:[^<>]+)>/.exec(elem.ref.name) ?? []
				if (text && href) {
					elem.ref = { href }
					elem.children = [text]
				} else {
					// eslint-disable-next-line no-console
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
	if (typeof section === 'string') throw new ASTError(`Body starts with string: ${section}`, section)
	if (section.type !== m.Type.Section) throw new ASTError('No section!', section, section.pos)
	if (section.children.length === 0) throw new ASTError('Empty Section', section, section.pos)
	const title = section.children[0]
	if (typeof title === 'string') throw new ASTError(`Section starts with string: ${title}`, section.pos)
	if (title.type !== m.Type.Title) throw new ASTError('No title!', title, title.pos)
	const text = title.children[0]
	if (typeof text !== 'string') throw new ASTError('Empty title!', title, title.pos)
	return text.trim()
}

function getMeta(fieldLists: m.Elem) {
	const check = ((n) => typeof n !== 'string' && n.type === m.Type.FieldList) as ((n: m.Node) => n is m.FieldList)
	return Object.fromEntries(
		fieldLists.children
			.filter(check)
			.flatMap((fl) => fl.children as m.Field[])
			.map((f) => [f.name, f.children[0].toString()]),
	)
}

export default function rstConvert(code: string): m.Document {
	let parsed
	try {
		parsed = rst.default.default.parse(code, { position: true, blanklines: true, indent: true })
	} catch (e) {
		if (e instanceof SyntaxError) {
			throw new ParseError(e, e.location.start) // TODO: capture end too
		} else {
			throw e
		}
	}
	const targets = extractTargets(parsed)
	const children = resolveTargets(convertNode(parsed, 0), targets)

	const metadata = (children[0] as m.Elem).type === m.Type.Section
		? {}
		: getMeta(children.shift() as m.Elem)

	return { title: getTitle(children), children, metadata }
}
