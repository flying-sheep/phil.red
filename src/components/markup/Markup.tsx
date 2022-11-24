import { Children, Component } from 'react'
import { Document, Node } from '../../markup/MarkupDocument'
import MarkupNodeComponent, { High } from './MarkupNodeComponent'

export interface MarkupProps {
	doc: Document
}

export interface MarkupState {
	errorMessage: string
}

export default class Markup extends Component<MarkupProps, MarkupState> {
	children: Node[]

	constructor(props: MarkupProps) {
		super(props)
		const { doc } = props
		// this.title = doc.title
		this.children = doc.children // DEBUG
	}
	
	static getDerivedStateFromError(error: Error) {
		return { errorMessage: error.message }
	}
	
	render(): React.ReactElement<any> {
		const nodes = this.children.map((e) => <MarkupNodeComponent node={e} level={0}/>)
		const article = <article>{Children.toArray(nodes)}</article>
		if (process.env.NODE_ENV === 'development') {
			return (
				<>
					{article}
					<High
						language="json"
						code={JSON.stringify(this.children, undefined, '\t')}
						style={{
							marginLeft: 'calc(50% - 50vw + 1em)',
							marginRight: 'calc(50% - 50vw + 1em)',
							overflowY: 'auto',
						}}
					/>
				</>
			)
		}
		return article
	}
}
