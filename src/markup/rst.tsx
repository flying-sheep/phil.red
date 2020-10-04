/** @jsx data */
import { data } from 'typed-jsx'
import * as rst from 'restructured'
import * as m from './MarkupDocument'
import ASTError from './AstError'


interface Directive {
	header: string | null
	params: { [k: string]: string }
	body: string[]
}

// https://github.com/microsoft/TypeScript/issues/21699

function parseDirective(lines: rst.Node[]): Directive {
	const texts = lines.map(n => (n.type === 'text' ? n.value as string : JSON.stringify(n)))
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
			// eslint-disable-next-line no-param-reassign
			obj[name] = val
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
		return [<m.Link ref={{name}}>{[name]}</m.Link>]
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
			>{convertChildren(node, level)}</m.BulletList>
		]
	case 'list_item':
		return [<m.ListItem>{convertChildren(node, level)}</m.ListItem>]
	case 'interpreted_text':
		switch (node.role) {
		case 'math':
			return [<m.InlineMath math={(node.children || []).map(text => text.value).join('')}/>]
		case null:
			return [<m.Emph>{convertChildren(node, level)}</m.Emph>]
		default:
			throw new ASTError(`Unknown role “${node.role}”`, node)
		}
	case 'directive':
		switch (node.directive as rst.DirectiveType | 'plotly') {
		case 'code':
			const { header, body } = parseDirective(node.children || [])
			return [<m.CodeBlock language={header || undefined}>{body}</m.CodeBlock>]
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
					{body.map(r => (
						<m.Row>
							{r.split(delim).map(cell => (
								<m.Cell>{cell}</m.Cell>
							))}
						</m.Row>
					))}
				</m.Table>
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
				/>
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
	return (node.children || []).reduce((ns: m.Node[], n: rst.Node) => [...ns, ...convertNode(n, level)], [])
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
	const pending =
		Array.from(extractTargetsInner(node))
		.reduce((obj, [k, v]) => { obj[k] = v; return obj }, {} as {[key: string]: string})
	const resolved: {[key: string]: string} = {}
	let newResolvable = true
	while (newResolvable) {
		newResolvable = false
		for (let [k, v] of Object.entries(pending)) {
			if (v in resolved) v = resolved[v]  // now the match will be true
			// TODO: more schemas
			if (v.match(URL_SCHEMA)) {
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

function resolveTargets(root: m.Elem, targets: {[key: string]: string}): m.Elem {
	root = {...root}
	if (root.type === m.Type.Link && 'name' in root.ref && root.ref.name in targets) {
		root.ref = { href: targets[root.ref.name] }
	}
	root.children = (root.children || []).map(c => typeof c === 'string' ? c : resolveTargets(c, targets))
	return root
}

function getTitle(root: m.Elem): string {
	const body = root.children
	if ((body[0] as m.Elem).type !== m.Type.Section) throw new ASTError('No section!', body && body[0])
	const section = (body[0] as m.Elem).children
	if ((section[0] as m.Elem).type !== m.Type.Title) throw new ASTError('No title!', section && section[0])
	const title = (section[0] as m.Elem).children
	if (!(typeof title[0] === 'string')) throw new ASTError('Empty title!', title && title[0])
	return title[0]
}

export default function rstConvert(code: string): m.Document {
	const parsed = rst.default.parse(code)
	const root = resolveTargets(
		convertNode(parsed, 0)[0] as m.Elem,
		extractTargets(parsed),
	)
	return {
		title: getTitle(root),
		children: [root],
	}
}
