import type { ParseResult } from '@arborium/arborium'
import type { PaletteMode, SxProps, Theme } from '@mui/material'
import { type FC, useEffect, useMemo, useState } from 'react'
import CodeBlock from '../../CodeBlock.js'

// TODO: https://github.com/bearcove/arborium/issues/93
const ARB_MAP = [
	['at', 'attribute'],
	['co', 'constant'],
	['fb', 'function.builtin'],
	['f', 'function'],
	['kw', 'keyword'],
	['o', 'operator'],
	['pr', 'property'],
	['p', 'punctuation'],
	['pb', 'punctuation.bracket'],
	['pd', 'punctuation.delimiter'],
	['s', 'string'],
	['ss', 'string.special'],
	['tg', 'tag'],
	['t', 'type'],
	['tb', 'type.builtin'],
	['v', 'variable'],
	['vb', 'variable.builtin'],
	['vp', 'variable.parameter'],
	['c', 'comment'],
	['m', 'macro'],
	['l', 'label'],
	['da', 'diff.addition'],
	['dd', 'diff.deletion'],
	['n', 'number'],
	['tl', 'text.literal'],
	['te', 'text.emphasis'],
	['ts', 'text.strong'],
	['tu', 'text.uri'],
	['tr', 'text.reference'],
	['se', 'string.escape'],
	['tt', 'text.title'],
	['ps', 'punctuation.special'],
	['tx', 'text.strikethrough'],
	['sp', 'spell'],
]

const cssTheme = (mode: PaletteMode) =>
	Object.fromEntries(
		ARB_MAP.map(([short, long]) => [
			`::highlight(${long})`,
			{ color: `var(--arb-${short}-${mode})` },
		]),
	)

/** Global styles for highlights */
export const highStyles = (theme: Theme) => [
	theme.applyStyles('dark', cssTheme('dark')),
	theme.applyStyles('light', cssTheme('light')),
]

export interface HighProps<Theme extends object = object> {
	code: string
	parsed: ParseResult
	language: string
	sx?: SxProps<Theme>
}

const High: FC<HighProps<Theme>> = ({ code, parsed, language, ...props }) => {
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
