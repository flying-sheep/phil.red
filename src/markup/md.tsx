/** @jsx data */
import { data } from 'typed-jsx'
import MarkdownIt from 'markdown-it'
import Token from 'markdown-it/lib/token'

import { rsplit } from '../utils'
import * as m from './MarkupDocument'
import ASTError from './AstError'

const NO_END = Symbol('no end')

/** https://github.com/microsoft/TypeScript/issues/21699 */
function x(n: unknown): m.Element {
	return n as m.Element
}

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

function convertNode(token: Token): m.Node[] {
	switch (token.type) {
	case 'inline':
		return convertChildren(token)
	case 'text':
		return [token.content]
	case 'paragraph':
		return [x(<m.Paragraph>{convertChildren(token)}</m.Paragraph>)]
	case 'heading':
		return [data(token.tag, {}, convertChildren(token))]
	case 'link': {
		const hrefs = token.attrs.filter(([a, v]) => a === 'href')
		return [x(<a href={hrefs[0][1]}>{convertChildren(token)}</a>)]
	}
	case 'hardbreak':
		return [x(<br/>)]
	case 'softbreak':
		return []
	case 'code_inline':
		return [x(<code>{token.content}</code>)]
	case 'fence':
		return [x(<pre><code>{token.content}</code></pre>)]
	case 'bullet_list':
		return [x(<ul>{convertChildren(token)}</ul>)]
	case 'list_item':
		return [x(<li>{convertChildren(token)}</li>)]
	default:
		throw new ASTError(`Unknown token type “${token.type}”`, JSON.stringify(token))
	}
}

function convertChildren(token: Token): m.Node[] {
	return convertAll(token.children || [])
}
function convertAll(tokens: Token[]) {
	return tokens.reduce((acc: m.Node[], n: Token) => acc.concat(convertNode(n)), [])
}

export default function mdConvert(code: string): m.Document {
	// https://github.com/rollup/rollup-plugin-commonjs/issues/350
	const md = new MarkdownIt('commonmark', { breaks: false })
	const ast = Array.from(tokens2ast(md.parse(code, {})))
	const title = ast[0].children[0].content
	const children = convertAll(ast)
	return { title, children }
}
