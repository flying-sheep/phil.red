import { mergeSx } from 'merge-sx'
import { ComponentProps, forwardRef } from 'react'

import Box from '@mui/material/Box'

import Code, { CodeProps } from './Code'

export interface CodeBlockProps extends Omit<ComponentProps<typeof Box>, 'component' | 'children'> {
	children?: CodeProps['children']
	noWrap?: boolean
	slotProps?: {
		code?: Omit<CodeProps, 'children'>
	}
}

const CodeBlock = forwardRef<HTMLElement, CodeBlockProps>(
	({ noWrap = false, sx, children, slotProps, ...props }, ref) => {
		const { sx: codeSx, ...codeProps } = slotProps?.code ?? {}
		return (
			<Box component="pre" ref={ref} sx={mergeSx({ lineHeight: '124%' }, sx)} {...props}>
				{noWrap ? (
					children
				) : (
					<Code sx={mergeSx({ fontFamily: 'Iosevka, monospace' }, codeSx)} {...codeProps}>
						{children}
					</Code>
				)}
			</Box>
		)
	},
)

export default CodeBlock
