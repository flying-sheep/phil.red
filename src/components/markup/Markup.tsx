import * as React from 'react'

import { Typography } from '@material-ui/core'

import ASTErrorMessage, { ASTErrorMessageProps } from './ASTErrorMessage'
import { Document, Node, Element, Type } from '../../markup/MarkupDocument'

const ReferenceContext = React.createContext({} as { [name: string ]: string})

export interface MarkupProps {
	doc: Document
}

export default class Markup extends React.Component {
	title: string | React.ReactElement<ASTErrorMessageProps>
	children: Node[]

	constructor(props: MarkupProps) {
		super(props)
		const { doc } = props
		this.title = doc.title
		this.children = doc.children // DEBUG
		this.state = { errorMessage: null }
	}
	
	static getDerivedStateFromError(error: Error) {
		return { errorMessage: error.message }
	}
	
	render(): React.ReactElement<any> {
		const nodes = convertChildren(this)
		const references: { [name: string]: string } = {}
		for (const [name, target] of extractTargets(this.ast)) {
			references[name] = target
		}
		const rendered = (
			<ReferenceContext.Provider value={references}>
				{nodes}
			</ReferenceContext.Provider>
		)
		if (process.env.NODE_ENV === 'development') {
			return (
				<article>
					{rendered}
					<pre>{JSON.stringify(rendered, undefined, '\t')}</pre>
				</article>
			)
		}
		return <article>{rendered}</article>
	}
}

export interface MarkupElementProps {
	node: Node
}

export interface MarkupElementState {
	errorMessage: string | null
}

function convertChildren(elem: Element | Document | Markup): React.ReactChild[] {
	return React.Children.toArray(
		elem.children.map(e => <MarkupNodeComponent node={e}/>),
	)
}

export class MarkupNodeComponent extends React.Component
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
		const references = this.context
		if (errorMessage !== null) {
			return <ASTErrorMessage ast={node}>{errorMessage}</ASTErrorMessage>
		}
		switch (token.type) {
		case 'inline':
			return convertChildren(token)
		case 'text':
			return token.content
		case 'paragraph':
			return <Typography paragraph>{convertChildren(token)}</Typography>
		case 'heading':
			return <Typography variant={token.tag as ThemeStyle}>{convertChildren(token)}</Typography>
		case 'link': {
			const hrefs = token.attrs.filter(([a, v]) => a === 'href')
			return <a href={hrefs[0][1]}>{convertChildren(token)}</a>
		}
		case 'hardbreak':
			return <br/>
		case 'softbreak':
			return <> </>
		case 'code_inline':
			return <code>{token.content}</code>
		case 'fence':
			return <pre><code>{token.content}</code></pre>
		case 'bullet_list':
			return <ul>{convertChildren(token)}</ul>
		case 'list_item':
			return <li>{convertChildren(token)}</li>
		default:
			throw new ASTError(`Unknown token type “${token.type}”`, token)
		}
		switch (node.type) {
		case 'document':
			return convertChildren(node, level)
		case 'comment':
			return null
		case 'reference': {
			const name = (node.children as [Node])[0].value as string
			return <a href={references[name]}>{name}</a>
		}
		case 'section':
			return <section>{convertChildren(node, level + 1)}</section>
		case 'title': {
			if (level < 1) return `Header with level ${level} < 1`
			const hLevel = Math.min(level, 6)
			return <Typography variant={`h${hLevel}` as ThemeStyle}>{convertChildren(node, level)}</Typography>
		}
		case 'paragraph':
			return <Typography paragraph>{convertChildren(node, level)}</Typography>
		case 'text':
			return `${node.value}\n`
		case 'literal':
			return <code>{convertChildren(node, level)}</code>
		case 'emphasis':
			return <em>{convertChildren(node, level)}</em>
		case 'bullet_list':
			return <ul className={node.bullet}>{convertChildren(node, level)}</ul>
		case 'list_item':
			return <li>{convertChildren(node, level)}</li>
		case 'interpreted_text':
			switch (node.role) {
			case 'math':
				return <InlineMath math={(node.children || []).map(text => text.value).join('')}/>
			case undefined:
				return <em>{convertChildren(node, level)}</em>
			default:
				throw new ASTError(`Unknown role “${node.role}”`, node)
			}
		case 'directive':
			switch (node.directive as DirectiveType | 'plotly') {
			case 'code':
				return <pre><code>{convertChildren(node, level)}</code></pre>
			case 'csv-table': {
				const { header, params, body } = ReStructuredTextNode.parseDirective(node.children || [])
				const delim = (() => {
					switch (params.delim) {
					case 'tab': return '\t'
					case 'space': return ' '
					default: return params.delim
					}
				})()
				return (
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
				)
			}
			// custom
			case 'plotly': {
				const { header, params } = ReStructuredTextNode.parseDirective(node.children || [])
				return (
					<Plotly
						url={header || ''}
						onClickLink={params.onClickLink}
						style={{ width: '100%' }}
						config={{ responsive: true } as any} // typing has no responsive
					/>
				)
			}
			default:
				throw new ASTError(`Unknown directive “${node.directive}”`, node)
			}
		default:
			throw new ASTError(`Unknown node type “${node.type}”`, node)
		}
	}
}
