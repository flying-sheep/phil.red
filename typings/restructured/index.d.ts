declare module 'restructured' {
	export type InlineNodeType = 'text' | 'literal' | 'emphasis' | 'strong'
	export type BlockNodeType =
		| 'document'
		| 'section'
		| 'comment'
		| 'reference'
		| 'title'
		| 'paragraph'
		| 'block_quote'
		| 'interpreted_text'
		| 'literal_block'
		| 'directive'
		| 'bullet_list'
		| 'enumerated_list'
		| 'list_item'
		| 'definition_list'
		| 'definition_list_item'
		| 'term'
		| 'definition'
	export type RoleType = null | 'math' | 'pep'
	export type BulletType = '*' | '+' | '-' | '•' | '‣' | '⁃'
	export type DirectiveType = 'code' | 'code-block' | 'csv-table'
	export interface Positon {
		offset: number
		line: number
		column: number
	}
	export type BaseNode<HasPos> = HasPos extends true ? NodeWithPos : object
	export interface NodeWithPos {
		position: { start: Positon, end: Positon }
	}
	export type BlockNode<HasPos> = BaseNode<HasPos> & {
		type: BlockNodeType
		children: Node<HasPos>[]
		blanklines?: string[]
		indent?: { width: number, offset: number }
	}
	export type InlineNode<HasPos> = BaseNode<HasPos> & {
		type: InlineNodeType
		value: string
	}
	export type Section<HasPos> = BlockNode<HasPos> & {
		type: 'section'
		depth: number
	}
	export type BulletList<HasPos> = BlockNode<HasPos> & {
		type: 'bullet_list'
		bullet: BulletType
	}
	export type Directive<HasPos> = BlockNode<HasPos> & {
		type: 'directive'
		directive: DirectiveType
	}
	export type InterpretedText<HasPos> = BlockNode<HasPos> & {
		type: 'interpreted_text'
		role: RoleType
	}
	export type OtherBlockNode<HasPos> = BlockNode<HasPos> & {
		type: Exclude<BlockNodeType, 'section' | 'bullet_list' | 'directive' | 'interpreted_text'>
	}
	export type OtherInlineNode<HasPos> = InlineNode<HasPos> & {
		// type: Exclude<InlineNodeType, ...>
	}
	export type Node<HasPos> =
		| Section<HasPos>
		| BulletList<HasPos>
		| Directive<HasPos>
		| InterpretedText<HasPos>
		| OtherBlockNode<HasPos>
		| OtherInlineNode<HasPos>
	export type Options<HasPos> = {
		blanklines?: boolean
		indent?: boolean
	} & (HasPos extends true ? { position: true } : { position?: false })
	interface RST {
		parse(code: string, options?: Options<true>): Node<true>
		parse(code: string, options?: Options<false>): Node<false>
	}
	const weird: { default: RST }
	export default weird
}

declare module 'restructured/lib/Parser.js' {
	/* eslint import/no-extraneous-dependencies: ['error', {devDependencies: true}] */

	import { Positon } from 'restructured'

	export class SyntaxError extends Error {
		message: string
		expected: string | null
		found: string | null
		location: { start: Positon, end: Positon }
	}
	const exports: { SyntaxError: typeof SyntaxError }
	export default exports
}
