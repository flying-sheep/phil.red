import * as React from 'react'
import { Typography } from '@material-ui/core'
import { ThemeStyle } from '@material-ui/core/styles/createTypography'
import { Node, DirectiveType } from 'restructured'
import { InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'

import Markup from './Markup'
import ASTError, { ASTErrorMessage } from './ASTError'
import Plotly from '../Plotly'
import rstConvert from '../../converters/rst'

export interface ReStructuredTextNodeProps {
	node: Node
	level: number
}
export interface ReStructuredTextNodeState {
	errorMessage: string | null
}

interface Directive {
	header: string | null
	params: { [k: string]: string }
	body: string[]
}

export class ReStructuredTextNode extends React.Component
	<ReStructuredTextNodeProps, ReStructuredTextNodeState> {
	constructor(props: ReStructuredTextNodeProps) {
		super(props)
		this.state = { errorMessage: null }
	}
	
	static getDerivedStateFromError(error: Error) {
		return { errorMessage: error.message }
	}
	
	static parseDirective(lines: Node[]): Directive {
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
				obj[name] = val
				return obj
			}, {} as { [k: string]: string })
		const body = rest.slice(lastParam + 1)
		return { header, params, body }
	}
	
	render(): React.ReactElement<any> | null {
		const { node, level } = this.props
		const { errorMessage } = this.state
		if (errorMessage !== null) {
			return <ASTErrorMessage ast={node}>{errorMessage}</ASTErrorMessage>
		}
		switch (node.type) {
		case 'document':
			return <>{convertChildren(node, level)}</>
		case 'comment':
			return null
		case 'reference':
			return <ASTErrorMessage>{`Unhandled reference: ${(node.children as Node[])[0].value}`}</ASTErrorMessage>
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
			return <>{`${node.value}\n`}</>
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
				const { header } = ReStructuredTextNode.parseDirective(node.children || [])
				return <Plotly url={header || ''}/>
			}
			default:
				throw new ASTError(`Unknown directive “${node.directive}”`, node)
			}
		default:
			throw new ASTError(`Unknown node type “${node.type}”`, node)
		}
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
