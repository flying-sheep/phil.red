import * as React from 'react'
import red from '@material-ui/core/colors/red'

export default class ASTError<AST> extends Error {
	message: string
	ast: AST
	constructor(message: string, ast: AST) {
		super(message)
		this.message = message
		this.ast = ast
		Object.setPrototypeOf(this, ASTError.prototype)
	}
	
	toString() {
		return `AST Error: ${this.message}\n${JSON.stringify(this.ast)}`
	}
}

export interface ASTErrorMessageProps<AST> {
	ast?: AST
}

export function ASTErrorMessage<AST>(
	{ ast, children }: ASTErrorMessageProps<AST> & { children: React.ReactNode },
) {
	return (
		<span style={{ color: red.A400 }}>
			{children}
			{ast && <pre>{JSON.stringify(ast, undefined, 2)}</pre>}
		</span>
	)
}
