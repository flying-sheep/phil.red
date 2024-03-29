export default class ASTError extends Error {
	override message: string
	node: unknown
	pos: number | undefined
	loc: { line: number; column: number } | undefined
	constructor(
		message: string,
		node: unknown,
		pos?: number | { line: number; column: number; offset?: number },
	) {
		super()
		this.message = `${message}\n${JSON.stringify(node, undefined, '\t')}`
		this.node = node
		this.pos = typeof pos === 'object' ? pos.offset : pos
		this.loc = typeof pos === 'object' ? pos : undefined
		Object.setPrototypeOf(this, ASTError.prototype)
	}
}
