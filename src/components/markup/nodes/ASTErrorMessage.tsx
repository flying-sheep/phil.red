import type { FC } from 'react'

import Box from '@mui/material/Box'
import red from '@mui/material/colors/red'

import type { Node } from '../../../markup/MarkupDocument'
import CodeBlock from '../../CodeBlock'

export interface ASTErrorMessageProps {
	node?: Node
	children: React.ReactNode
}

const ASTErrorMessage: FC<ASTErrorMessageProps> = ({
	node,
	children,
}: ASTErrorMessageProps) => (
	<Box sx={{ color: red.A400 }}>
		{children}
		{node && <CodeBlock>{JSON.stringify(node, undefined, 2)}</CodeBlock>}
	</Box>
)

export default ASTErrorMessage
