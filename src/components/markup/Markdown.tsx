import * as React from 'react'
import { Typography } from '@material-ui/core'
import { ThemeStyle } from '@material-ui/core/styles/createTypography'

import Token, { TokenType } from 'markdown-it/lib/token'

import Markup from './Markup'
import mdConvert from '../../converters/md'


type MDConverters = {
	[ T in TokenType ]: (token: Token) => React.ReactNode
}

const converters: MDConverters = {
	inline(token: Token) {
		return convertChildren(token)
	},
	text(token: Token) {
		return token.content
	},
	paragraph(token: Token) {
		return <Typography paragraph>{convertChildren(token)}</Typography>
	},
	heading(token: Token) {
		return <Typography variant={token.tag as ThemeStyle}>{convertChildren(token)}</Typography>
	},
	link(token: Token) {
		const hrefs = token.attrs.filter(([a, v]) => a === 'href')
		return <a href={hrefs[0][1]}>{convertChildren(token)}</a>
	},
	hardbreak(token: Token) {
		return <br/>
	},
	softbreak(token: Token) {
		return ' '
	},
	code_inline(token: Token) {
		return <code>{token.content}</code>
	},
	fence(token: Token) {
		return <pre><code>{token.content}</code></pre>
	},
	bullet_list(token: Token) {
		return <ul>{convertChildren(token)}</ul>
	},
	list_item(token: Token) {
		return <li>{convertChildren(token)}</li>
	},
}

function convert(token: Token): React.ReactNode {
	const converter = converters[token.type as TokenType]
	if (converter === undefined) {
		return JSON.stringify(token)
	}
	return converter(token)
}

function convertChildren(token: Token): React.ReactNode[] {
	return (token.children || []).map(convert)
}

export default class Markdown extends Markup<Token> {
	getAST(): Token {
		return mdConvert(this.props.code)
	}
	
	getTitle(): string {
		return this.ast.children[0].children[0].content
	}
	
	renderPost(): React.ReactNode {
		return convert(this.ast)
	}
}
