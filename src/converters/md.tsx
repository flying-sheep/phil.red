import * as React from 'react'
import { Typography } from '@material-ui/core'


import * as MarkdownIt from 'markdown-it'


type TokenType = 'inline' | 'text' | 'softbreak' | 'hardbreak' | 'code_inline'

type MDConverters = {
	[ T in TokenType ]: (token: MarkdownIt.Token) => React.ReactElement<{}>
}

const converters: MDConverters = {
	inline(token: MarkdownIt.Token) {
		return <>{convertChildren(token)}</>
	},
	text(token: MarkdownIt.Token) {
		return <Typography paragraph>{token.content}</Typography>
	},
	softbreak(token: MarkdownIt.Token) {
		return <></>
	},
	hardbreak(token: MarkdownIt.Token) {
		return React.createElement(token.tag)
	},
	code_inline(token: MarkdownIt.Token) {
		return <code>{token.content}</code>
	},
}

function convert(token: MarkdownIt.Token): React.ReactElement<{}> {
	const converter = converters[token.type as TokenType]
	if (converter === undefined) {
		return <>{JSON.stringify(token)}</>
	}
	return converter(token)
}

function convertChildren(token: MarkdownIt.Token): React.ReactElement<{}>[] {
	return (token.children || []).map(convert)
}


export default function mdConvert(code: string): React.ReactElement<{}> {
	// https://github.com/rollup/rollup-plugin-commonjs/issues/350
	const Mdi = (MarkdownIt as any).default
	const md: MarkdownIt.MarkdownIt = new Mdi('commonmark', { breaks: false })
	const tokens = md.parseInline(code, {})
	// return <>{tokens.map(convert)}</>
	return <>{tokens.map(convert)}<pre>{JSON.stringify(tokens, undefined, 2)}</pre></>
}
