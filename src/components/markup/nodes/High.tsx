import { highlights, type Utf16ParseResult } from '@arborium/arborium'
import type { PaletteMode, SxProps, Theme } from '@mui/material/styles'
import { type FC, useEffect, useMemo, useState } from 'react'
import CodeBlock from '../../CodeBlock.js'

/* font-weight and font-style are not supported by the feature, so we map them to something else:
 * https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::highlight#allowable_properties
 * unfortunately, text-shadow and stroke are *also* not supported by most browsers:
 * https://github.com/mdn/browser-compat-data/issues/28852
 */
const styles = (tag: string, mode: PaletteMode) => ({
	color: `var(--arb-${tag}-${mode})`,
	textDecoration: `var(--arb-${tag}-${mode}-decoration)`,
	WebkitTextStroke: `if(style(--arb-${tag}-${mode}-weight: bold): thin;)`,
	textShadow: `if(style(--arb-${tag}-${mode}-style: italic): 0 0 1ex var(--arb-${tag}-${mode});)`,
})

const cssTheme = (mode: PaletteMode) =>
	Object.fromEntries(
		highlights.flatMap(({ name, tag, parentTag }) =>
			parentTag ? [] : [[`code::highlight(${name})`, styles(tag, mode)]],
		),
	)

/** Global styles for highlights */
export const highStyles = (theme: Theme) => [
	theme.applyStyles('dark', cssTheme('dark')),
	theme.applyStyles('light', cssTheme('light')),
]

export interface HighProps<Theme extends object = object> {
	code: string
	parsed: Utf16ParseResult
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
		return () => {
			for (const [k, highlight] of highlights.entries()) {
				const existing = CSS.highlights.get(k)
				if (!existing) continue
				for (const range of highlight) existing.delete(range)
			}
		}
	}, [highlights])

	return (
		<CodeBlock ref={setNode} className={`language-${language}`} {...props}>
			{code}
		</CodeBlock>
	)
}

function convert(
	node: HTMLPreElement,
	parsed: Utf16ParseResult,
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
