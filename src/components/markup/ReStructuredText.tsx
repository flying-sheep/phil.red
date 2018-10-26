import * as React from 'react'
import { Typography } from '@material-ui/core'
import { ThemeStyle } from '@material-ui/core/styles/createTypography'
import { Node, NodeType, DirectiveType } from 'restructured'

import Markup from './Markup'
import { ASTError } from './ASTError'
import rstConvert from '../../converters/rst'


type DirectiveConverters = {
	[ T in DirectiveType ]: (node: Node, level: number) => React.ReactNode
}

const directives: DirectiveConverters = {
	code(node: Node, level: number) {
		return <pre><code>{convertChildren(node, level)}</code></pre>
	},
	'csv-table': (node: Node) => {
		const texts = (node.children || [])
			.map(n => (n.type === 'text' ? n.value : JSON.stringify(n)))
		const [header = null, ...rest] = texts
		return (
			<table>
				{header && <caption>{header}</caption>}
				{rest.map(r => <tr>{r}</tr>)}
			</table>
		)
	},
}

type RSTConverters = {
	[ T in NodeType ]: (node: Node, level: number) => React.ReactNode
}

const converters: RSTConverters = {
	document(node: Node, level: number) {
		return <>{convertChildren(node, level)}</>
	},
	section(node: Node, level: number) {
		return <section>{convertChildren(node, level + 1)}</section>
	},
	title(node: Node, level: number) {
		if (level < 1) return `Header with level ${level} < 1`
		const hLevel = Math.min(level, 6)
		return <Typography variant={`h${hLevel}` as ThemeStyle}>{convertChildren(node, level)}</Typography>
	},
	paragraph(node: Node, level: number) {
		return <Typography paragraph>{convertChildren(node, level)}</Typography>
	},
	text(node: Node, level: number) {
		return <>{node.value}</>
	},
	literal(node: Node, level: number) {
		return <code>{convertChildren(node, level)}</code>
	},
	emphasis(node: Node, level: number) {
		return <em>{convertChildren(node, level)}</em>
	},
	directive(node: Node, level: number) {
		if (node.directive !== undefined && node.directive in directives) {
			const converter = directives[node.directive]
			return converter(node, level)
		}
		return <code>{`Unknown directive ${node.directive}: ${JSON.stringify(node)}`}</code>
	},
	bullet_list(node: Node, level: number) {
		return <ul className={node.bullet}>{convertChildren(node, level)}</ul>
	},
	list_item(node: Node, level: number) {
		return <li>{convertChildren(node, level)}</li>
	},
}

function convert(node: Node, level: number): React.ReactNode {
	const converter = converters[node.type]
	if (converter === undefined) {
		return JSON.stringify(node)
	}
	return converter(node, level)
}

function convertChildren(node: Node, level: number): React.ReactNode[] {
	return (node.children || []).map(c => convert(c, level))
}

export default class ReStructuredText extends Markup<Node> {
	getAST(): Node {
		return rstConvert(this.props.code)
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
		return convert(this.ast, 0)
	}
}
