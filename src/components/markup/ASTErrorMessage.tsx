import { FC } from 'react'

import red from '@mui/material/colors/red'
import Box from '@mui/material/Box'

import { Node } from '../../markup/MarkupDocument'

export interface ASTErrorMessageProps {
	node?: Node
	children: React.ReactNode
}

const ASTErrorMessage: FC<ASTErrorMessageProps> = ({
	node, children,
}: ASTErrorMessageProps) => (
	<Box sx={{ color: red.A400 }}>
		{children}
		{node && <pre>{JSON.stringify(node, undefined, 2)}</pre>}
	</Box>
)

export default ASTErrorMessage
