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
        'emphasis' |
        'directive' |
        'bullet_list' |
        'list_item'
	)
	export type DirectiveType = (
		'code' |
		'csv-table'
	)
    export interface Node {
        type: NodeType
        children?: Node[]
        value?: string
        directive?: DirectiveType
        bullet?: '-' | string
    }
    interface RST {
        parse(code: string): Node
    }
    const rst: RST
    export default rst
}
