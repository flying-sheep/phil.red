import * as React from 'react'
import red from '@material-ui/core/colors/red'
import { MarkupNode } from '../../markup/MarkupDocument'

export interface ASTErrorMessageProps {
	node?: MarkupNode
}

export function ASTErrorMessage(
	{ node, children }: ASTErrorMessageProps & { children: React.ReactNode },
) {
	return (
		<span style={{ color: red.A400 }}>
			{children}
			{node && <pre>{JSON.stringify(node, undefined, 2)}</pre>}
		</span>
	)
}
