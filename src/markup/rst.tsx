/** @jsx markupElement */
import * as rst from 'restructured'
import * as m from './MarkupDocument'
import { markupElement } from './MarkupDocument'
import ASTError from './AstError'

interface Directive {
	header: string | null
	params: { [k: string]: string }
	body: string[]
}

// https://github.com/microsoft/TypeScript/issues/21699

function parseDirective(lines: rst.Node[]): Directive {
	const texts = lines.map((n) => (n.type === 'text' ? n.value as string : JSON.stringify(n)))
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
			const [, name, val] = /^:(\w+):\s(.*)+/.exec(line) as string[]
			obj[name] = val // eslint-disable-line no-param-reassign
			return obj
		}, {} as { [k: string]: string })
	const body = rest.slice(lastParam + 1)
	return { header, params, body }
}

function convertNode(node: rst.Node, level: number): m.Node[] {
	switch (node.type) {
	case 'document':
		return convertChildren(node, level)
	case 'comment':
		return []
	case 'reference': {
		const name = node.children?.[0].value as string
		return [<m.Link ref={{ name }}>{[name]}</m.Link>]
	}
	case 'section':
		return [<m.Section>{convertChildren(node, level + 1)}</m.Section>]
	case 'title': {
		if (level < 1) throw new ASTError(`Header with level ${level} < 1`, node)
		const hLevel = Math.min(level, 6)
		return [<m.Title level={hLevel}>{convertChildren(node, level)}</m.Title>]
	}
	case 'paragraph':
		return [<m.Paragraph>{convertChildren(node, level)}</m.Paragraph>]
	case 'text':
		return [`${node.value}\n`]
	case 'literal':
		return [<m.Code>{convertChildren(node, level)}</m.Code>]
	case 'emphasis':
		return [<m.Emph>{convertChildren(node, level)}</m.Emph>]
	case 'bullet_list':
		return [
			<m.BulletList
				bullet={node.bullet ? m.Bullet.text : undefined}
				text={node.bullet || undefined}
			>
				{convertChildren(node, level)}
			</m.BulletList>,
		]
	case 'enumerated_list':
		return [<m.EnumList>{convertChildren(node, level)}</m.EnumList>]
	case 'list_item':
		return [<m.ListItem>{convertChildren(node, level)}</m.ListItem>]
	case 'definition_list':
		return [<m.DefList>{convertChildren(node, level)}</m.DefList>]
	case 'definition_list_item':
		return [<m.DefItem>{convertChildren(node, level)}</m.DefItem>]
	case 'term':
		return [<m.DefTerm>{convertChildren(node, level)}</m.DefTerm>]
	case 'definition':
		return [<m.Def>{convertChildren(node, level)}</m.Def>]
	case 'interpreted_text':
		switch (node.role) {
		case 'math':
			return [<m.InlineMath math={(node.children || []).map((text) => text.value).join('')}/>]
		case null:
			return [<m.Emph>{convertChildren(node, level)}</m.Emph>]
		default:
			throw new ASTError(`Unknown role “${node.role}”`, node)
		}
	case 'directive':
		switch (node.directive as rst.DirectiveType | 'plotly') {
		case 'code-block':
		case 'code': {
			const { header, body } = parseDirective(node.children || [])
			return [<m.CodeBlock language={header || undefined}>{body}</m.CodeBlock>]
		}
		case 'csv-table': {
			const { header, params, body } = parseDirective(node.children || [])
			const delim = (() => {
				switch (params.delim) {
				case 'tab': return '\t'
				case 'space': return ' '
				default: return params.delim
				}
			})()
			return [
				<m.Table caption={header || undefined}>
					{body.map((r) => (
						<m.Row>
							{r.split(delim).map((cell) => (
								<m.Cell>{cell}</m.Cell>
							))}
						</m.Row>
					))}
				</m.Table>,
			]
		}
		// custom
		case 'plotly': {
			const { header, params } = parseDirective(node.children || [])
			return [
				<m.Plotly
					url={header || ''}
					onClickLink={params.onClickLink}
					style={{ width: '100%' }}
					config={{ responsive: true } as any} // typing has no responsive
				/>,
			]
		}
		default:
			throw new ASTError(`Unknown directive “${node.directive}”`, node)
		}
	default:
		throw new ASTError(`Unknown node type “${node.type}”`, node)
	}
}

function convertChildren(node: rst.Node, level: number): m.Node[] {
	return (node.children || []).reduce(
		(ns: m.Node[], n: rst.Node) => [...ns, ...convertNode(n, level)],
		[],
	)
}

function* extractTargetsInner(elem: rst.Node): IterableIterator<[string, string]> {
	for (const child of elem.children || []) {
		if (typeof child === 'string') continue
		if (child.type === 'comment') {
			const comment = (child.children as [rst.Node])[0].value as string
			const [, name = null, href = null] = /^_([^:]+):\s+(.+)$/.exec(comment) || []
			if (name !== null && href !== null) yield [name, href]
		} else if (child.children) {
			yield* extractTargetsInner(child)
		}
	}
}

const URL_SCHEMA = /^https?:.*$/

function extractTargets(node: rst.Node): {[key: string]: string} {
	const pending = Object.fromEntries(extractTargetsInner(node))
	const resolved: {[key: string]: string} = {}
	let newResolvable = true
	while (newResolvable) {
		newResolvable = false
		for (const entry of Object.entries(pending)) {
			const k = entry[0]
			const v = entry[1] in resolved ? resolved[entry[1]] : entry[1] // if so the match will be true
			// TODO: more schemas
			if (v.match(URL_SCHEMA)) {
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
		if (elem.type === m.Type.Link && 'name' in elem.ref && elem.ref.name in targets) {
			elem.ref = { href: targets[elem.ref.name] }
		}
		elem.children = resolveTargets(elem.children, targets)
		return elem
	})
}

function getTitle(body: m.Node[]): string {
	if ((body[0] as m.Elem).type !== m.Type.Section) throw new ASTError('No section!', body && body[0])
	const section = (body[0] as m.Elem).children
	if ((section[0] as m.Elem).type !== m.Type.Title) throw new ASTError('No title!', section && section[0])
	const title = (section[0] as m.Elem).children
	if (!(typeof title[0] === 'string')) throw new ASTError('Empty title!', title && title[0])
	return title[0]
}

export default function rstConvert(code: string): m.Document {
	const parsed = rst.default.parse(code)
	const children = convertNode(parsed, 0)
	const targets = extractTargets(parsed)
	return {
		title: getTitle(children),
		children: resolveTargets(children, targets),
	}
}
