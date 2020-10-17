import * as React from 'react'

import { Document, Node } from '../../markup/MarkupDocument'
import { ASTErrorMessageProps } from './ASTErrorMessage'
import MarkupNodeComponent from './MarkupNodeComponent'

export interface MarkupProps {
	doc: Document
}

export default class Markup extends React.Component {
	title: string | React.ReactElement<ASTErrorMessageProps>
	children: Node[]

	constructor(props: MarkupProps) {
		super(props)
		const { doc } = props
		this.title = doc.title
		this.children = doc.children // DEBUG
	}
	
	static getDerivedStateFromError(error: Error) {
		return { errorMessage: error.message }
	}
	
	render(): React.ReactElement<any> {
		const nodes = this.children.map((e) => <MarkupNodeComponent node={e} level={0}/>)
		const body = React.Children.toArray(nodes)
		if (process.env.NODE_ENV === 'development') {
			return (
				<article>
					{body}
					<pre>{JSON.stringify(this.children, undefined, '\t')}</pre>
				</article>
			)
		}
		return <article>{body}</article>
	}
}
