declare module 'restructured' {
    export type NodeType = 'document' | 'section' | 'title' | 'paragraph' | 'text' | 'literal' | 'directive' | 'bullet_list' | 'list_item'
    export interface Node {
        type: NodeType
        children?: Node[]
        value?: string
        directive?: 'code' | string
        bullet?: '-' | string
    }
    interface RST {
        parse(code: string): Node
    }
    const rst: rst
    export default rst
}
