import type { ParseResult } from '@arborium/arborium'
import type { SxProps } from '@mui/material'
import { mergeSx } from 'merge-sx'
import { type FC, useEffect, useMemo, useState } from 'react'
import CodeBlock from '../../CodeBlock.js'

const HIGH = {
	'&::highlight(string)': {
		color: 'darkred',
	},
}

export interface HighProps<Theme extends object = object> {
	code: string
	parsed: ParseResult
	language: string
	sx?: SxProps<Theme>
}

const High: FC<HighProps> = ({ code, parsed, language, sx, ...props }) => {
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
				? new Highlight(...existing, ...highlight)
				: highlight
			CSS.highlights.set(k, updated)
		}
		//return () => { CSS.highlights.delete(id) }
	}, [highlights])

	const sx2 = mergeSx(HIGH, sx)

	return (
		<CodeBlock
			ref={setNode}
			className={`language-${language}`}
			sx={sx2}
			{...props}
		>
			{code}
		</CodeBlock>
	)
}

function convert(
	node: HTMLPreElement,
	parsed: ParseResult,
): Map<string, Highlight> {
	const highlights = new Map<string, Highlight>()
	const codeElem = node.querySelector('&>code:only-child')
	if (!codeElem) throw new Error('No pre>code node')
	const textNode = codeElem.childNodes[0]
	if (!textNode) throw new Error('No text node')

	for (const span of parsed.spans) {
		const range = new Range()
		range.setStart(textNode, span.start)
		range.setEnd(textNode, span.end)
		const highlight = highlights.get(span.capture) || new Highlight()
		highlight.add(range)
		highlights.set(span.capture, highlight)
	}

	return highlights
}

export default High
