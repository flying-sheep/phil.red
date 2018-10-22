import * as React from 'react'
import { Typography } from '@material-ui/core'
import restructured, { Node, NodeType } from 'restructured'


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

export default function rstConvert(code: string): React.ReactElement<{}> {
	const root = restructured.parse(code)
	return <>{convert(root)}</>
	// return <pre>{JSON.stringify(root, undefined, '\t')}</pre>
}
