import type { ParseResult } from '@arborium/arborium'
import type { SxProps } from '@mui/material'
import { type FC, useEffect, useMemo, useState } from 'react'
import CodeBlock from '../../CodeBlock.js'

export interface HighProps<Theme extends object = object> {
	code: string
	parsed: ParseResult
	language: string
	sx?: SxProps<Theme>
}

const High: FC<HighProps> = ({ code, parsed, language, ...props }) => {
	// const theme = useTheme()
	//const codeTheme = theme.palette.mode === 'dark' ? themes.vsDark : themes.vsLight
	const [node, setNode] = useState<HTMLPreElement | null>(null)

	const highlights = useMemo(
		() => node && convert(node, parsed),
		[node, parsed],
	)

	useEffect(() => {
		if (!highlights) return
		for (const [k, highlight] of highlights.entries()) {
			const existing = CSS.highlights.get(k)
			const updated = existing
				? new Highlight(...existing.union(highlight))
				: highlight
			CSS.highlights.set(k, updated)
		}
		//return () => { CSS.highlights.delete(id) }
	}, [highlights])

	return (
		<CodeBlock ref={setNode} className={`language-${language}`} {...props}>
			{code}
		</CodeBlock>
	)
}

function convert(
	node: HTMLPreElement,
	parsed: ParseResult,
): Map<string, Highlight> {
	const highlights = new Map<string, Highlight>()

	//const range1 = new Range()
	//range1.setStart(node, 10)
	//range1.setEnd(node, 20)

	return highlights
}

export default High
