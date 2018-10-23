import * as MarkdownIt from 'markdown-it'
import Token from 'markdown-it/lib/token'

import { rsplit } from '../utils'


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

export default function mdConvert(code: string): Token {
	// https://github.com/rollup/rollup-plugin-commonjs/issues/350
	const Mdi = (MarkdownIt as any).default
	const md: MarkdownIt.MarkdownIt = new Mdi('commonmark', { breaks: false })
	const tokens = md.parse(code, {})
	return tokens2ast(tokens)
}
