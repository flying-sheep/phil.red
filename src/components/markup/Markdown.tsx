import * as React from 'react'
import { Typography } from '@material-ui/core'
import { ThemeStyle } from '@material-ui/core/styles/createTypography'

import Token, { TokenType } from 'markdown-it/lib/token'

import Markup from './Markup'
import mdConvert from '../../converters/md'


function convert(token: Token): React.ReactNode {
	switch (token.type as TokenType | undefined) {
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
		return ' '
	case 'code_inline':
		return <code>{token.content}</code>
	case 'fence':
		return <pre><code>{token.content}</code></pre>
	case 'bullet_list':
		return <ul>{convertChildren(token)}</ul>
	case 'list_item':
		return <li>{convertChildren(token)}</li>
	default:
		return JSON.stringify(token)
	}
}

function convertChildren(token: Token): React.ReactNode[] {
	return (token.children || []).map(convert)
}

export default class Markdown extends Markup<Token> {
	getAST(): Token {
		return mdConvert(this.markup)
	}
	
	getTitle(): string {
		return this.ast.children[0].children[0].content
	}
	
	renderPost(): React.ReactNode {
		return convert(this.ast)
	}
}
