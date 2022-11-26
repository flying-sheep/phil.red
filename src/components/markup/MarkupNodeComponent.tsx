import Link from '@mui/material/Link'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import { Variant } from '@mui/material/styles/createTypography'
import { Children, FC } from 'react'
import TeX from '@matejmazur/react-katex'

import {
	Node, Elem, Type, Bullet,
} from '../../markup/MarkupDocument'
import { ASTError } from '../../markup'
import Plotly from '../Plotly'
import ASTErrorMessage from './nodes/ASTErrorMessage'
import High from './nodes/High'

export interface MarkupElementProps {
	node: Node
	level: number
}

export interface MarkupElementState {
	errorMessage: string | null
}

function convertChildren(elem: Elem, level: number) {
	const children = elem.children.map((e) => <MarkupNodeComponent node={e} level={level}/>)
	return <>{Children.toArray(children)}</>
}

const MarkupNodeComponentInner: FC<MarkupElementProps> = ({ node, level }) => {
	// eslint-disable-next-line react/jsx-no-useless-fragment
	if (typeof node === 'string') return <>{`${node}\n`}</>
	switch (node.type) {
	// Block
	case Type.Section:
		return <section>{convertChildren(node, level + 1)}</section>
	case Type.Title: {
		if (node.level < 1) throw new ASTError(`Header with level ${node.level} < 1`, node)
		const hLevel = Math.min(node.level, 6)
		return (
			<Typography id={node.anchor} variant={`h${hLevel}` as Variant}>
				{convertChildren(node, level)}
			</Typography>
		)
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
		return <ol style={{ listStyleType: node.enumeration }}>{convertChildren(node, level)}</ol>
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
	case Type.CodeBlock: {
		const code = node.children.map((c) => c.toString()).join('\n')
		if (!node.language) {
			return <pre><code>{code}</code></pre>
		}
		return <High code={code} language={node.language}/>
	}
	case Type.Table:
		return (
			<figure>
				<table><tbody>{convertChildren(node, level)}</tbody></table>
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
		return <TeX math={node.math}/>
	// custom
	case Type.Plotly: {
		const { type, ...props } = node
		return <Plotly {...props}/>
	}
	default:
		throw new ASTError(`Unknown type ${(node as Elem).type}`, node)
	}
}

const MarkupNodeComponent: FC<MarkupElementProps> = ({ node, level }) => {
	try {
		return <MarkupNodeComponentInner node={node} level={level}/>
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : `${error}`
		return <ASTErrorMessage node={node}>{errorMessage}</ASTErrorMessage>
	}
}

export default MarkupNodeComponent
