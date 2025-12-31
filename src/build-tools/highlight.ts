import { loadGrammar, type ParseResult } from '@arborium/arborium'

export default async function highlightCode(
	code: string,
	lang: string,
): Promise<ParseResult> {
	const grammar = await loadGrammar(lang)
	if (!grammar) throw new Error(`Unknown language: ${lang}`)
	return grammar.parse(code)
}
