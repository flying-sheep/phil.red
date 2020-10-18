/** @jsx data */
import { data } from 'typed-jsx'
import * as MarkdownIt from 'markdown-it'
import * as Token from 'markdown-it/lib/token'

import { rsplit } from '../utils'
import * as m from './MarkupDocument'
import ASTError from './ASTError'

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
			token.children = Array.from(tokens2ast(token.children || []))
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
		return [<m.Paragraph>{convertChildren(token)}</m.Paragraph>]
	case 'heading': {
		const level = /h(?<level>[1-6])/.exec(token.tag)?.groups?.level
		if (!level) throw new ASTError(`Unexpected header tag ${token.tag}`, token)
		return [<m.Title level={parseInt(level, 10)}>{convertChildren(token)}</m.Title>]
	}
	case 'link': {
		const href = token.attrs?.filter(([a, v]) => a === 'href')?.[0]?.[1]
		if (!href) throw new ASTError('Link without href encountered', token)
		return [<m.Link ref={{ href }}>{convertChildren(token)}</m.Link>]
	}
	case 'hardbreak':
		return [<m.LineBreak/>]
	case 'softbreak':
		return []
	case 'code_inline':
		return [<m.Code>{token.content}</m.Code>]
	case 'fence':
		return [<m.CodeBlock>{token.content}</m.CodeBlock>]
	case 'bullet_list':
		return [<m.BulletList>{convertChildren(token)}</m.BulletList>]
	case 'list_item':
		return [<m.ListItem>{convertChildren(token)}</m.ListItem>]
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
	const title = ast[0].children?.[0].content || ''
	const children = convertAll(ast)
	return { title, children }
}
