declare module 'restructured' {
    export type InlineNodeType = (
        'text' |
		'literal' |
		'emphasis' |
		'strong'
	)
    export type BlockNodeType = (
        'document' |
        'section' |
        'comment' |
        'reference' |
        'title' |
        'paragraph' |
		'interpreted_text' |
        'directive' |
		'bullet_list' |
		'enumerated_list' |
		'list_item' |
		'definition_list' |
		'definition_list_item' |
		'term' |
		'definition'
	)
	export type RoleType = null | 'math'
	export type BulletType = '*' | '+' | '-' | '•' | '‣' | '⁃'
	export type DirectiveType = (
		'code' | 'code-block' |
		'csv-table'
	)
    export interface BlockNode {
        type: BlockNodeType
        children: Node[]
	}
    export interface InlineNode {
        type: InlineNodeType
        value: string
	}
	export interface Section extends BlockNode { type: 'section'; depth: number }
	export interface BulletList extends BlockNode { type: 'bullet_list'; bullet: BulletType }
	export interface Directive extends BlockNode { type: 'directive'; directive: DirectiveType }
	export interface InterpretedText extends BlockNode { type: 'interpreted_text'; role: RoleType }
    export interface OtherBlockNode extends BlockNode {
        type: Exclude<BlockNodeType, 'section' | 'bullet_list' | 'directive' | 'interpreted_text'>
	}
    export interface OtherInlineNode extends InlineNode {
        // type: Exclude<InlineNodeType, ...>
	}
	export type Node = (
		Section | BulletList | Directive | InterpretedText | OtherBlockNode |
		OtherInlineNode
	)
    interface RST {
        parse(code: string): Node
    }
    const rst: RST
    export default rst
}
