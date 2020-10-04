export default class ASTError extends Error {
	message: string
	node: any
	constructor(message: string, node: any) {
		super(message)
		this.message = message
		this.node = node
		Object.setPrototypeOf(this, ASTError.prototype)
	}
	
	toString() {
		return `AST Error: ${this.message}\n${JSON.stringify(this.node)}`
	}
}
