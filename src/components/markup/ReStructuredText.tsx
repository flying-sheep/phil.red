import * as React from 'react'
import { Typography } from '@material-ui/core'
import { Node, NodeType } from 'restructured'

import Markup from './Markup'
import { ASTError } from './ASTError'
import rstConvert from '../../converters/rst'


type RSTConverters = {
	[ T in NodeType ]: (node: Node) => React.ReactElement<{}>
}

const converters: RSTConverters = {
	document(node: Node) {
		return <>{convertChildren(node)}</>
	},
	section(node: Node) {
		return <section>{convertChildren(node)}</section>
	},
	title(node: Node) {
		return <Typography variant="h6">{convertChildren(node)}</Typography>
	},
	paragraph(node: Node) {
		return <Typography paragraph>{convertChildren(node)}</Typography>
	},
	text(node: Node) {
		return <>{node.value}</>
	},
	literal(node: Node) {
		return <code>{convertChildren(node)}</code>
	},
	directive(node: Node) {
		if (node.directive === 'code') {
			return <pre><code>{convertChildren(node)}</code></pre>
		}
		return <code>{`Unknown directive ${node.directive}: ${JSON.stringify(node)}`}</code>
	},
	bullet_list(node: Node) {
		return <ul className={node.bullet}>{convertChildren(node)}</ul>
	},
	list_item(node: Node) {
		return <li>{convertChildren(node)}</li>
	},
}

function convert(node: Node): React.ReactElement<{}> {
	const converter = converters[node.type]
	if (converter === undefined) {
		return <>{JSON.stringify(node)}</>
	}
	return converter(node)
}

function convertChildren(node: Node): React.ReactElement<{}>[] {
	return (node.children || []).map(convert)
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
		return convert(this.ast)
	}
}
