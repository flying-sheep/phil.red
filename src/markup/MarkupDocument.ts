export enum Type {
	Link,
	Section,
	Title,
}

export interface Element<A extends {[name: string]: any}> {
	type: Type
	children: Node[]
	attrs: A
}

export type Node = string | Element<any>

export interface Document {
	title: string
	children: Node[]
}
export const Document = (props: Document) => props


// Concrete ones

interface Link extends Element<{ref: string}> {
	type: Type.Link
	attrs: {ref: string}
}
export const Link = (props: Omit<Link, 'type'>) => ({ type: Type.Link, ...props })
