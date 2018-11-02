import * as React from 'react'
import ASTError, { ASTErrorMessage, ASTErrorMessageProps } from './ASTError'

export default abstract class Markup<AST> {
	markup: string
	ast: AST
	title: string | React.ReactElement<ASTErrorMessageProps<AST>>
	constructor(markup: string) {
		this.markup = markup
		this.ast = this.getAST()
		try {
			this.title = this.getTitle()
		} catch (e) {
			if (e instanceof ASTError) {
				this.title = <ASTErrorMessage ast={e.ast}>{e.message}</ASTErrorMessage>
			} else throw e
		}
	}
	
	render(): React.ReactElement<any> {
		const rendered = this.renderPost()
		if (process.env.NODE_ENV === 'development') {
			return (
				<article>
					{rendered}
					<pre>{JSON.stringify(this.ast, undefined, '\t')}</pre>
				</article>
			)
		}
		return <article>{rendered}</article>
	}
	
	abstract getAST(): AST
	abstract getTitle(): string
	abstract renderPost(): React.ReactNode
}
