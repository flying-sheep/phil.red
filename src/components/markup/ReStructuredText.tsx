import * as React from 'react'
import { Typography } from '@material-ui/core'
import { ThemeStyle } from '@material-ui/core/styles/createTypography'
import { Node } from 'restructured'

import Markup from './Markup'
import ASTError from './ASTError'
import rstConvert from '../../converters/rst'

export interface ReStructuredTextNodeProps {
	node: Node
	level: number
}

export function ReStructuredTextNode(
	{ node, level }: ReStructuredTextNodeProps,
): React.ReactElement<any> | null {
	switch (node.type) {
	case 'document':
		return <>{convertChildren(node, level)}</>
	case 'section':
		return <section>{convertChildren(node, level + 1)}</section>
	case 'title': {
		if (level < 1) return <>{`Header with level ${level} < 1`}</>
		const hLevel = Math.min(level, 6)
		return <Typography variant={`h${hLevel}` as ThemeStyle}>{convertChildren(node, level)}</Typography>
	}
	case 'paragraph':
		return <Typography paragraph>{convertChildren(node, level)}</Typography>
	case 'text':
		return <>{node.value}</>
	case 'literal':
		return <code>{convertChildren(node, level)}</code>
	case 'emphasis':
		return <em>{convertChildren(node, level)}</em>
	case 'bullet_list':
		return <ul className={node.bullet}>{convertChildren(node, level)}</ul>
	case 'list_item':
		return <li>{convertChildren(node, level)}</li>
	case 'directive':
		switch (node.directive) {
		case 'code':
			return <pre><code>{convertChildren(node, level)}</code></pre>
		case 'csv-table': {
			const texts = (node.children || [])
				.map(n => (n.type === 'text' ? n.value as string : JSON.stringify(n)))
			const [header = null, ...rest] = texts
			const delim = rest
				.filter(l => l.startsWith(':delim:'))
				.reduce((_, cur) => {
					switch (cur.split(':delim: ')[1]) {
					case 'tab': return '\t'
					case 'space': return ' '
					default: return cur
					}
				}, ',')
			/*
			const quote = rest
				.filter(l => l.startsWith(':quote:'))
			*/
			const lines = rest.filter(l => !/^:(delim|quote):/.test(l))
			return (
				<figure>
					<table>
						{lines.map(r => (
							<tr>
								{r.split(delim).map(cell => (
									<td>{cell}</td>
								))}
							</tr>
						))}
					</table>
					{header && <figcaption>{header}</figcaption>}
				</figure>
			)
		}
		default:
			throw new ASTError(`Unknown directive ${node.directive}`, node)
		}
	default:
		throw new ASTError(`Unknown node type ${node.type}`, node)
	}
}

function convertChildren(node: Node, level: number): React.ReactNode[] {
	return (node.children || []).map(n => <ReStructuredTextNode node={n} level={level}/>)
}

export default class ReStructuredText extends Markup<Node> {
	getAST(): Node {
		return rstConvert(this.markup)
	}
	
	getTitle(): string {
		const body = this.ast.children
		if (body === undefined || body[0].type !== 'section') throw new ASTError('No section!', body && body[0])
		const section = body[0].children
		if (section === undefined || section[0].type !== 'title') throw new ASTError('No title!', section && section[0])
		const title = section[0].children
		if (title === undefined || title[0].type !== 'text') throw new ASTError('Empty title!', title && title[0])
		return title[0].value as string
	}
	
	renderPost(): React.ReactNode {
		return <ReStructuredTextNode node={this.ast} level={0}/>
	}
}
