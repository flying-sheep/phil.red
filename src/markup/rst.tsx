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
		case undefined:
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
	return (node.children || []).reduce((ns: m.Node[], n: rst.Node) => ns.concat(convertNode(n, level)), [])
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
