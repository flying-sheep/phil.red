import { mergeSx } from 'merge-sx'
import { type ComponentProps, forwardRef } from 'react'

import Box from '@mui/material/Box'

import Code, { type CodeProps } from './Code'

export interface CodeBlockProps
	extends Omit<ComponentProps<typeof Box<'pre'>>, 'component' | 'children'> {
	children?: CodeProps['children']
	noWrap?: boolean
	slotProps?: {
		code?: Omit<CodeProps, 'children'>
	}
}

const CodeBlock = forwardRef<HTMLPreElement, CodeBlockProps>(
	({ noWrap = false, sx, children, slotProps, ...props }, ref) => {
		const { sx: codeSx, ...codeProps } = slotProps?.code ?? {}
		return (
			<Box
				component="pre"
				ref={ref}
				sx={mergeSx({ lineHeight: '124%', overflowInline: 'auto' }, sx)}
				{...props}
			>
				{noWrap ? (
					children
				) : (
					<Code
						sx={mergeSx(
							{ fontFamily: 'Iosevka, monospace', lineHeight: '124%' },
							codeSx,
						)}
						{...codeProps}
					>
						{children}
					</Code>
				)}
			</Box>
		)
	},
)

export default CodeBlock
