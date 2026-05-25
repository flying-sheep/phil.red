import type { Position } from './MarkupDocument'

export default class ASTError extends Error {
	override message: string
	node: unknown
	//pos: number | undefined
	loc: Position | undefined
	constructor(message: string, node: unknown, pos?: number | Position) {
		super()
		this.message = `${message}\n${JSON.stringify(node, undefined, '\t')}`
		this.node = node
		//this.pos = = typeof pos === 'object' ? pos.offset : pos
		this.loc = typeof pos === 'object' ? pos : undefined
		Object.setPrototypeOf(this, ASTError.prototype)
	}
}
