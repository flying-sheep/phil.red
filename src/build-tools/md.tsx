/** @jsxImportSource ../markup */
/* eslint import/no-extraneous-dependencies: ['error', {devDependencies: true}] */

import MarkdownIt from 'markdown-it'
import Token from 'markdown-it/lib/token.js'

import ASTError from '../markup/ASTError'
import * as m from '../markup/MarkupDocument'
import { rsplit } from '../utils'

const NO_END = Symbol('no end')

function* tokens2ast(
	tokens: Token[] | IterableIterator<Token>,
	end: string | typeof NO_END = NO_END,
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
			token.children = Array.from(tokens2ast(token.children ?? []))
			yield token
		} else {
			yield token
		}
	}
}

function pos(token: Token) {
	return token.map ? { line: token.map[0], column: 1 } : undefined
}

function convertNode(token: Token): m.Node[] {
	switch (token.type) {
	case 'inline':
		return convertChildren(token)
	case 'text':
		return [token.content]
	case 'paragraph':
		return [<m.Paragraph pos={pos(token)}>{convertChildren(token)}</m.Paragraph>]
	case 'heading': {
		const level = /h(?<level>[1-6])/.exec(token.tag)?.groups?.['level']
		if (!level) throw new ASTError(`Unexpected header tag ${token.tag}`, token)
		const anchor = undefined // TODO
		return [
			<m.Title level={parseInt(level, 10)} anchor={anchor} pos={pos(token)}>
				{convertChildren(token)}
			</m.Title>,
		]
	}
	case 'link': {
		const [, href] = token.attrs?.find(([name]) => name === 'href') ?? []
		if (!href) throw new ASTError('Link without href encountered', token)
		return [<m.Link ref={{ href }} pos={pos(token)}>{convertChildren(token)}</m.Link>]
	}
	case 'hardbreak':
		return [<m.LineBreak pos={pos(token)}/>]
	case 'softbreak':
		return []
	case 'code_inline':
		return [<m.Code pos={pos(token)}>{token.content}</m.Code>]
	case 'fence':
		return [<m.CodeBlock pos={pos(token)}>{token.content}</m.CodeBlock>]
	case 'bullet_list':
		return [<m.BulletList pos={pos(token)}>{convertChildren(token)}</m.BulletList>]
	case 'list_item':
		return [<m.ListItem pos={pos(token)}>{convertChildren(token)}</m.ListItem>]
	default:
		throw new ASTError(`Unknown token type “${token.type}”`, JSON.stringify(token))
	}
}

function convertChildren(token: Token): m.Node[] {
	return convertAll(token.children ?? [])
}
function convertAll(tokens: Token[]) {
	return tokens.reduce((acc: m.Node[], n: Token) => acc.concat(convertNode(n)), [])
}

export default function mdConvert(code: string): m.Document {
	// https://github.com/rollup/rollup-plugin-commonjs/issues/350
	const md = new MarkdownIt('commonmark', { breaks: false })
	const ast = Array.from(tokens2ast(md.parse(code, {})))
	const title = ast[0]?.children?.[0]?.content ?? ''
	const children = convertAll(ast)
	return { title, children, metadata: {} }
}
