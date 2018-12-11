import * as React from 'react'
import { Typography } from '@material-ui/core'
import { ThemeStyle } from '@material-ui/core/styles/createTypography'

import Token from 'markdown-it/lib/token'

import Markup from './Markup'
import ASTError, { ASTErrorMessage } from './ASTError'
import mdConvert from '../../converters/md'


export interface MarkdownElementProps {
	token: Token
}

export interface MarkdownElementState {
	errorMessage: string | null
}

export class MarkdownNode extends React.Component
	<MarkdownElementProps, MarkdownElementState> {
	constructor(props: MarkdownElementProps) {
		super(props)
		this.state = { errorMessage: null }
	}
	
	static getDerivedStateFromError(error: Error) {
		return { errorMessage: error.message }
	}
	
	render(): React.ReactNode {
		const { token } = this.props
		const { errorMessage } = this.state
		if (errorMessage !== null) {
			return <ASTErrorMessage ast={token}>{errorMessage}</ASTErrorMessage>
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
	}
}

function convertChildren(token: Token): React.ReactChild[] {
	return React.Children.toArray(
		(token.children || []).map(tok => <MarkdownNode token={tok}/>),
	)
}

export default class Markdown extends Markup<Token> {
	getAST(): Token {
		return mdConvert(this.markup)
	}
	
	getTitle(): string {
		return this.ast.children[0].children[0].content
	}
	
	renderPost(): React.ReactNode {
		return <MarkdownNode token={this.ast}/>
	}
}
