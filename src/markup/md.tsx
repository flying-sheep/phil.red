/** @jsx mkNode */
import MarkdownIt from 'markdown-it'
import Token from 'markdown-it/lib/token'

import { rsplit } from '../utils'
import MarkupDocument, { MarkupNode, MarkupElement } from './MarkupDocument'
import ASTError from './AstError'

const NO_END = Symbol('no end')

type XMLAttrs = {[attr: string]: string}

function mkNode(tag: string, attrs: XMLAttrs = {}, children: MarkupNode[] = []): MarkupNode {
	return { tag, children, attrs }
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

function convertNode(token: Token): MarkupNode[] {
	switch (token.type) {
	case 'inline':
		return convertChildren(token)
	case 'text':
		return [token.content]
	case 'paragraph':
		return [<p>{convertChildren(token)}</p> as unknown as MarkupElement]
	case 'heading':
		return [mkNode(token.tag, {}, convertChildren(token))]
	case 'link': {
		const hrefs = token.attrs.filter(([a, v]) => a === 'href')
		return [<a href={hrefs[0][1]}>{convertChildren(token)}</a> as unknown as MarkupElement]
	}
	case 'hardbreak':
		return [<br/> as unknown as MarkupElement]
	case 'softbreak':
		return []
	case 'code_inline':
		return [<code>{token.content}</code> as unknown as MarkupElement]
	case 'fence':
		return [<pre><code>{token.content}</code></pre> as unknown as MarkupElement]
	case 'bullet_list':
		return [<ul>{convertChildren(token)}</ul> as unknown as MarkupElement]
	case 'list_item':
		return [<li>{convertChildren(token)}</li> as unknown as MarkupElement]
	default:
		throw new ASTError(`Unknown token type “${token.type}”`, JSON.stringify(token))
	}
}

function convertChildren(token: Token): MarkupNode[] {
	return convertAll(token.children || [])
}
function convertAll(tokens: Token[]) {
	return tokens.reduce((acc: MarkupNode[], x: Token) => acc.concat(convertNode(x), []), [])
}

export default function mdConvert(code: string): MarkupDocument {
	// https://github.com/rollup/rollup-plugin-commonjs/issues/350
	const md = new MarkdownIt('commonmark', { breaks: false })
	const ast = Array.from(tokens2ast(md.parse(code, {})))
	const title = ast[0].children[0].content
	const children = convertAll(ast)
	return { title, children }
}
