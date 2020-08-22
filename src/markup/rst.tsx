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

/** https://github.com/microsoft/TypeScript/issues/21699 */
function x(n: unknown): m.Element {
	return n as m.Element
}

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
		const name = (node.children as [string])[0]
		return [x(<m.Link ref={references[name]}>{name}</a>)]
	}
	case 'section':
		return [x(<section>{convertChildren(node, level + 1)}</section>)]
	case 'title': {
		if (level < 1) return `Header with level ${level} < 1`
		const hLevel = Math.min(level, 6)
		return [x(<Typography variant={`h${hLevel}` as ThemeStyle}>{convertChildren(node, level)}</Typography>)]
	}
	case 'paragraph':
		return [x(<Typography paragraph>{convertChildren(node, level)}</Typography>)]
	case 'text':
		return [`${node.value}\n`]
	case 'literal':
		return [x(<code>{convertChildren(node, level)}</code>)]
	case 'emphasis':
		return [x(<em>{convertChildren(node, level)}</em>)]
	case 'bullet_list':
		return [x(<ul className={node.bullet}>{convertChildren(node, level)}</ul>)]
	case 'list_item':
		return [x(<li>{convertChildren(node, level)}</li>)]
	case 'interpreted_text':
		switch (node.role) {
		case 'math':
			return [x(<InlineMath math={(node.children || []).map(text => text.value).join('')}/>)]
		case undefined:
			return [x(<em>{convertChildren(node, level)}</em>)]
		default:
			throw new ASTError(`Unknown role “${node.role}”`, node)
		}
	case 'directive':
		switch (node.directive as rst.DirectiveType | 'plotly') {
		case 'code':
			return [x(<pre><code>{convertChildren(node, level)}</code></pre>)]
		case 'csv-table': {
			const { header, params, body } = parseDirective(node.children || [])
			const delim = (() => {
				switch (params.delim) {
				case 'tab': return '\t'
				case 'space': return ' '
				default: return params.delim
				}
			})()
			return [x(
				<figure>
					<table>
						{body.map(r => (
							<tr>
								{r.split(delim).map(cell => (
									<td>{cell}</td>
								))}
							</tr>
						))}
					</table>
					{header && <figcaption>{header}</figcaption>}
				</figure>
			)]
		}
		// custom
		case 'plotly': {
			const { header, params } = parseDirective(node.children || [])
			return [x(
				<Plotly
					url={header || ''}
					onClickLink={params.onClickLink}
					style={{ width: '100%' }}
					config={{ responsive: true } as any} // typing has no responsive
				/>
			)]
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

function* extractTargets(node: rst.Node): IterableIterator<[string, string]> {
	for (const child of node.children || []) {
		if (child.type === 'comment') {
			const comment = (child.children as [rst.Node])[0].value as string
			const [, name = null, href = null] = /^_([^:]+):\s+(.+)$/.exec(comment) || []
			if (name !== null && href !== null) yield [name, href]
		} else if (child.children) {
			yield* extractTargets(child)
		}
	}
}

function getTitle(root: m.Element): string {
	const body = root.children
	if (body === undefined || (body[0] as m.Element).type !== m.Type.Section) throw new ASTError('No section!', body && body[0])
	const section = (body[0] as m.Element).children
	if (section === undefined || (section[0] as m.Element).type !== m.Type.Title) throw new ASTError('No title!', section && section[0])
	const title = (section[0] as m.Element).children
	if (title === undefined || !(typeof title[0] === 'string')) throw new ASTError('Empty title!', title && title[0])
	return title[0]
}

export default function rstConvert(code: string): m.Document {
	const parsed = rst.default.parse(code)
	const root = convertNode(parsed, 0)[0] as m.Element
	return {
		title: getTitle(root),
		children: [root],
	}
}
