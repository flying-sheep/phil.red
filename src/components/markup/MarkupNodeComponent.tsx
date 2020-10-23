import * as React from 'react'

import Link from '@material-ui/core/Link'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Typography from '@material-ui/core/Typography'
import { Variant } from '@material-ui/core/styles/createTypography'
import { InlineMath } from 'react-katex'

import {
	Node, Elem, Type, Bullet,
} from '../../markup/MarkupDocument'
import { ASTError } from '../../markup'
import Plotly from '../Plotly'
import ASTErrorMessage from './ASTErrorMessage'

export interface MarkupElementProps {
	node: Node
	level: number
}

export interface MarkupElementState {
	errorMessage: string | null
}

function convertChildren(elem: Elem, level: number): React.ReactNode[] {
	const children = elem.children.map((e) => <MarkupNodeComponent node={e} level={level}/>)
	return React.Children.toArray(children)
}

export default class MarkupNodeComponent extends React.Component
	<MarkupElementProps, MarkupElementState> {
	constructor(props: MarkupElementProps) {
		super(props)
		this.state = { errorMessage: null }
	}
	
	static getDerivedStateFromError(error: Error) {
		return { errorMessage: error.message }
	}
	
	render(): React.ReactNode {
		const { node, level } = this.props
		const { errorMessage } = this.state
		if (errorMessage !== null) {
			return <ASTErrorMessage node={node}>{errorMessage}</ASTErrorMessage>
		}
		if (typeof node === 'string') return `${node}\n`
		switch (node.type) {
		// Block
		case Type.Section:
			return <section>{convertChildren(node, level + 1)}</section>
		case Type.Title: {
			if (node.level < 1) throw new ASTError(`Header with level ${node.level} < 1`, node)
			const hLevel = Math.min(node.level, 6)
			return <Typography variant={`h${hLevel}` as Variant}>{convertChildren(node, level)}</Typography>
		}
		case Type.Paragraph:
			return <Typography paragraph>{convertChildren(node, level)}</Typography>
		case Type.BlockQuote:
			return <blockquote>{convertChildren(node, level)}</blockquote>
		case Type.BulletList: {
			const listStyleType = node.bullet === Bullet.text ? node.text : node.bullet
			return <ul style={{ listStyleType }}>{convertChildren(node, level)}</ul>
		}
		case Type.EnumList:
			return <ul style={{ listStyleType: node.enumeration }}>{convertChildren(node, level)}</ul>
		case Type.ListItem:
			return <li>{convertChildren(node, level)}</li>
		case Type.DefList:
			return <dl>{convertChildren(node, level)}</dl>
		case Type.DefItem:
			return convertChildren(node, level)
		case Type.DefTerm:
			return <dt>{convertChildren(node, level)}</dt>
		case Type.Def:
			return <dd>{convertChildren(node, level)}</dd>
		case Type.FieldList:
			return (
				<Table size="small">
					<TableBody>
						{convertChildren(node, level)}
					</TableBody>
				</Table>
			)
		case Type.Field:
			return (
				<TableRow>
					<TableCell component="th" scope="row">{node.name}</TableCell>
					<TableCell>{convertChildren(node, level)}</TableCell>
				</TableRow>
			)
		case Type.CodeBlock:
			return <pre><code>{convertChildren(node, level)}</code></pre>
		case Type.Table:
			return (
				<figure>
					<table>{convertChildren(node, level)}</table>
					{node.caption && <figcaption>{node.caption}</figcaption>}
				</figure>
			)
		case Type.Row:
			return <tr>{convertChildren(node, level)}</tr>
		case Type.Cell:
			return <td>{convertChildren(node, level)}</td>
		// Inline
		case Type.LineBreak:
			return <br/>
		case Type.Emph:
			return <em>{convertChildren(node, level)}</em>
		case Type.Strong:
			return <strong>{convertChildren(node, level)}</strong>
		case Type.Link: {
			if ('name' in node.ref) throw new ASTError(`Unresolved reference ${node.ref.name}`, node)
			return <Link href={node.ref.href}>{convertChildren(node, level)}</Link>
		}
		case Type.Code:
			return <code>{convertChildren(node, level)}</code>
		case Type.InlineMath:
			return <InlineMath math={node.math}/>
		// custom
		case Type.Plotly: {
			const { type, ...props } = node
			return <Plotly {...props}/>
		}
		default:
			throw new ASTError(`Unknown type ${(node as Elem).type}`, node)
		}
	}
}
