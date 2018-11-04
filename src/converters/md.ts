import MarkdownIt from 'markdown-it'
import Token from 'markdown-it/lib/token'

import { rsplit } from '../utils'


const NO_END = Symbol('no end')

function* tokens2ast(
	tokens: Token[] | IterableIterator<Token>,
	end: string | Symbol = NO_END,
): IterableIterator<Token> {
	const tokenIter = tokens[Symbol.iterator]()
	for (const token of tokenIter) {
		if (end !== NO_END && token.type === `${end}_close`) {
			// console.log(end, 'close')
			break
		}
		const [openType, open] = rsplit(token.type, '_', 2)
		// console.log(openType, open, token.content)
		if (open === 'open') {
			const synth = new Token(openType, token.tag, 0)
			synth.attrs = token.attrs
			synth.children = Array.from(tokens2ast(tokenIter, openType))
			yield synth
		} else if (token.type === 'inline') {
			token.children = Array.from(tokens2ast(token.children))
			yield token
		} else {
			yield token
		}
	}
}

export default function mdConvert(code: string): Token {
	// https://github.com/rollup/rollup-plugin-commonjs/issues/350
	const md = new MarkdownIt('commonmark', { breaks: false })
	const tokens = md.parse(code, {})
	const root = new Token('inline', '', 0)
	root.children = Array.from(tokens2ast(tokens))
	return root
}
