import { Children, FC } from 'react'
import { Document } from '../../markup/MarkupDocument'
import MarkupNodeComponent from './MarkupNodeComponent'
import High from './nodes/High'

export interface MarkupProps {
	doc: Document
}

const Markup: FC<MarkupProps> = ({ doc: { children } }) => {
	const nodes = children.map((e) => <MarkupNodeComponent node={e} level={0}/>)
	const article = <article>{Children.toArray(nodes)}</article>
	if (process.env.NODE_ENV === 'development') {
		return (
			<>
				{article}
				<High
					language="json"
					code={JSON.stringify(children, undefined, '\t')}
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

export default Markup
