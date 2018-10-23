import * as React from 'react'
import { Typography } from '@material-ui/core'
import { ThemeStyle } from '@material-ui/core/styles/createTypography'

import * as MarkdownIt from 'markdown-it'
import Token from 'markdown-it/lib/token'

import { rsplit } from '../utils'


type TokenType = 'inline' | 'text' | 'paragraph' | 'heading' | 'hardbreak' | 'code_inline' | 'fence'

type MDConverters = {
	[ T in TokenType ]: (token: Token) => React.ReactElement<{}>
}

const converters: MDConverters = {
	inline(token: Token) {
		return <>{convertChildren(token)}</>
	},
	text(token: Token) {
		return <>{token.content}</>
	},
	paragraph(token: Token) {
		return <Typography paragraph>{convertChildren(token)}</Typography>
	},
	heading(token: Token) {
		return <Typography variant={token.tag as ThemeStyle}>{convertChildren(token)}</Typography>
	},
	hardbreak(token: Token) {
		return React.createElement(token.tag)
	},
	code_inline(token: Token) {
		return <code>{token.content}</code>
	},
	fence(token: Token) {
		return <pre><code>{token.content}</code></pre>
	},
}

function convert(token: Token): React.ReactElement<{}> {
	const converter = converters[token.type as TokenType]
	if (converter === undefined) {
		return <>{JSON.stringify(token)}</>
	}
	return converter(token)
}

function convertChildren(token: Token): React.ReactElement<{}>[] {
	return (token.children || []).map(convert)
}


const NO_END = Symbol('no end')

function tokens2ast(
	tokens: Token[] | IterableIterator<Token>,
	root: Token = new Token('inline', '', 0),
	end: string | Symbol = NO_END,
): Token {
	const tokenIter = tokens[Symbol.iterator]()
	for (const token of tokenIter) {
		if (end !== NO_END && token.type === `${end}_close`) break
		// eslint-disable-next-line no-param-reassign
		if (root.children === null) root.children = []
		const [openType, open] = rsplit(token.type, '_', 2)
		const node = open === 'open'
			? tokens2ast(tokenIter, new Token(openType, token.tag, 0), openType)
			: token
		root.children.push(node)
	}
	return root
}


export default function mdConvert(code: string): React.ReactElement<{}> {
	// https://github.com/rollup/rollup-plugin-commonjs/issues/350
	const Mdi = (MarkdownIt as any).default
	const md: MarkdownIt.MarkdownIt = new Mdi('commonmark', { breaks: false })
	const tokens = md.parse(code, {})
	const root = tokens2ast(tokens)
	return <>{convert(root)}</>
	// return <>{convert(root)}<pre>{JSON.stringify(root, undefined, 2)}</pre></>
}
