declare module 'restructured' {
    export type NodeType = (
        'document' |
        'section' |
        'comment' |
        'reference' |
        'title' |
        'paragraph' |
        'text' |
		'literal' |
		'interpreted_text' |
        'emphasis' |
        'directive' |
        'bullet_list' |
        'list_item'
	)
	export type RoleType = (
		'math'
	)
	export type DirectiveType = (
		'code' |
		'csv-table'
	)
    export interface Node {
        type: NodeType
        children?: Node[]
        value?: string
		role?: RoleType
		directive?: DirectiveType
        bullet?: '-' | string
    }
    interface RST {
        parse(code: string): Node
    }
    const rst: RST
    export default rst
}
