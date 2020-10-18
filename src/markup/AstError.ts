export default class ASTError extends Error {
	message: string
	node: any
	constructor(message: string, node: any) {
		super(`${message}\n${JSON.stringify(node)}`)
		this.message = message
		this.node = node
		Object.setPrototypeOf(this, ASTError.prototype)
	}
}
