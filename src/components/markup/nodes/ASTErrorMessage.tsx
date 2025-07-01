import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import type { FC } from 'react'

import type { Node } from '../../../markup/MarkupDocument'
import CodeBlock from '../../CodeBlock'

export interface ASTErrorMessageProps {
	node?: Node
	children: React.ReactNode
}

const ASTErrorMessage: FC<ASTErrorMessageProps> = ({
	node,
	children,
}: ASTErrorMessageProps) => {
	const theme = useTheme()
	return (
		<Box sx={{ color: theme.vars.palette.error.main }}>
			{children}
			{node && <CodeBlock>{JSON.stringify(node, undefined, 2)}</CodeBlock>}
		</Box>
	)
}

export default ASTErrorMessage
