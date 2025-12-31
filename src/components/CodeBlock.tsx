import Box from '@mui/material/Box'
import { mergeSx } from 'merge-sx'
import type { ComponentProps } from 'react'

import Code, { type CodeProps } from './Code'

export interface CodeBlockProps
	extends Omit<ComponentProps<typeof Box<'pre'>>, 'component' | 'children'> {
	ref?: React.Ref<HTMLPreElement>
	children?: CodeProps['children']
	noWrap?: boolean
	slotProps?: {
		code?: Omit<CodeProps, 'children'>
	}
}

const CodeBlock = ({
	noWrap = false,
	sx,
	children,
	slotProps,
	...props
}: CodeBlockProps) => {
	const { sx: codeSx, ...codeProps } = slotProps?.code ?? {}
	return (
		<Box
			component="pre"
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
}

export default CodeBlock
