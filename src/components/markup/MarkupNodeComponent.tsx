import Link from '@mui/material/Link'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import type {
	CSSPseudoSelectorProps,
	CSSSelectorObjectOrCssVariables,
	SystemCssProperties,
} from '@mui/system'
import { Children, type FC, useCallback } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { ASTError } from '../../markup'
import { Bullet, type Elem, type Node, Type } from '../../markup/MarkupDocument'
import CodeBlock from '../CodeBlock'
import CopySectionLinkButton from '../CopySectionLinkButton'
import Vega from '../Vega'
import ASTErrorMessage from './nodes/ASTErrorMessage'
import High from './nodes/High'

/** Actual type of `sx`, no idea why the one imported from `@mui/system` doesn’t work */
type SystemStyleObject<Theme extends object = object> =
	SystemCssProperties<Theme> &
		CSSPseudoSelectorProps<Theme> &
		CSSSelectorObjectOrCssVariables<Theme>

export interface MarkupElementProps {
	node: Node
	level: number
}

export interface MarkupElementState {
	errorMessage: string | null
}

function convertChildren(elem: Elem, level: number) {
	const children = elem.children.map((e, i) => (
		// biome-ignore lint/suspicious/noArrayIndexKey: Static tree, no need for key
		<MarkupNodeComponent node={e} level={level} key={i} />
	))
	return <>{Children.toArray(children)}</>
}

const MarkupNodeComponentInner: FC<MarkupElementProps> = ({ node, level }) => {
	if (typeof node === 'string') return <>{node}</>
	switch (node.type) {
		// Block
		case Type.Section:
			return <section>{convertChildren(node, level + 1)}</section>
		case Type.Title: {
			if (node.level < 1)
				throw new ASTError(`Header with level ${node.level} < 1`, node)
			const hLevel = Math.min(node.level, 6) as 1 | 2 | 3 | 4 | 5 | 6
			return (
				<Typography
					id={node.anchor}
					variant={`h${hLevel}`}
					gutterBottom
					sx={{ '&:not(:hover) > button': { display: 'none' } }}
				>
					{convertChildren(node, level)}
					{level > 1 && (
						<CopySectionLinkButton
							anchor={node.anchor}
							size={level >= 2 ? 'small' : 'medium'}
						/>
					)}
				</Typography>
			)
		}
		case Type.Paragraph:
			return (
				<Typography
					gutterBottom
					variant="body1"
					sx={{ hyphens: 'auto', textAlign: 'justify' }}
				>
					{convertChildren(node, level)}
				</Typography>
			)
		case Type.BlockQuote: {
			const sx: SystemStyleObject = {
				marginInlineStart: 5,
			}
			if (node.variant === 'epigraph') {
				sx.fontStyle = 'italic'
				sx.marginInlineEnd = 5
				sx['::before'] = {
					color: 'color(from currentcolor display-p3 r g b / .3)',
					content: 'open-quote',
					fontSize: '4em',
					lineHeight: '0.1em',
					marginRight: '0.25em',
					verticalAlign: '-0.4em',
				}
			}
			return (
				<Typography component="blockquote" sx={sx}>
					{convertChildren(node, level)}
				</Typography>
			)
		}
		case Type.BulletList: {
			const listStyleType =
				node.bullet === Bullet.text ? node.text : node.bullet
			return <ul style={{ listStyleType }}>{convertChildren(node, level)}</ul>
		}
		case Type.EnumList:
			return (
				<ol style={{ listStyleType: node.enumeration }} start={node.start}>
					{convertChildren(node, level)}
				</ol>
			)
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
					<TableBody>{convertChildren(node, level)}</TableBody>
				</Table>
			)
		case Type.Field:
			return (
				<TableRow>
					<TableCell component="th" scope="row">
						{node.name}
					</TableCell>
					<TableCell>{convertChildren(node, level)}</TableCell>
				</TableRow>
			)
		case Type.CodeBlock: {
			const code = node.children.join('\n')
			if (!node.language || !node.parsed) {
				return <CodeBlock>{code}</CodeBlock>
			}
			return <High code={code} parsed={node.parsed} language={node.language} />
		}
		case Type.Table:
			return (
				<figure>
					<table>
						<tbody>{convertChildren(node, level)}</tbody>
					</table>
					{node.caption && <figcaption>{node.caption}</figcaption>}
				</figure>
			)
		case Type.Row:
			return <tr>{convertChildren(node, level)}</tr>
		case Type.Cell:
			return <td>{convertChildren(node, level)}</td>
		// Inline
		case Type.LineBreak:
			return <br />
		case Type.Emph:
			return <em>{convertChildren(node, level)}</em>
		case Type.Strong:
			return <strong>{convertChildren(node, level)}</strong>
		case Type.Subscript:
			return <sub>{convertChildren(node, level)}</sub>
		case Type.Superscript:
			return <sup>{convertChildren(node, level)}</sup>
		case Type.Link: {
			if ('name' in node.ref)
				throw new ASTError(`Unresolved reference ${node.ref.name}`, node)
			return <Link href={node.ref.href}>{convertChildren(node, level)}</Link>
		}
		case Type.Code:
			return <code>{convertChildren(node, level)}</code>
		case Type.InlineMath: {
			// biome-ignore lint/security/noDangerouslySetInnerHtml: don’t want to model all of MathML
			return <span dangerouslySetInnerHTML={{ __html: node.math }} />
		}
		// custom
		case Type.Vega: {
			return (
				<Vega
					spec={node.spec}
					options={{ loader: { target: '_blank' } }}
					sx={{ width: '100%' }}
				/>
			)
		}
		default:
			throw new ASTError(`Unknown type ${(node as Elem).type}`, node)
	}
}

const MarkupNodeComponent: FC<MarkupElementProps> = ({ node, level }) => {
	const fallback = useCallback(
		({ error }: FallbackProps) => {
			console.error(error)
			const errorMessage =
				error instanceof Error ? error.message : `${error as unknown}`
			return <ASTErrorMessage node={node}>{errorMessage}</ASTErrorMessage>
		},
		[node],
	)
	return (
		<ErrorBoundary fallbackRender={fallback}>
			<MarkupNodeComponentInner node={node} level={level} />
		</ErrorBoundary>
	)
}

export default MarkupNodeComponent
