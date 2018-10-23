import * as React from 'react'
import red from '@material-ui/core/colors/red'

export class ASTError<AST> extends Error {
	msg: string
	ast: AST
	constructor(msg: string, ast: AST) {
		super()
		this.msg = msg
		this.ast = ast
	}
}

export interface ASTErrorMessageProps<AST> {
	ast: AST
}

export function ASTErrorMessage<AST>(
	{ ast, children }: ASTErrorMessageProps<AST> & { children: React.ReactNode },
) {
	return (
		<span style={{ color: red.A400 }}>
			{children}
			<pre>{JSON.stringify(ast, undefined, 2)}</pre>
		</span>
	)
}
