/**
 *
 * This whole thing could just be the `highlightCode` function,
 * were it not for
 * - https://github.com/yarnpkg/berry/issues/6678
 * - https://github.com/bearcove/arborium/issues/92
 */

import type { ParseResult } from '@arborium/arborium'
import { PosixFS, VirtualFS } from '@yarnpkg/fslib'
import { ZipOpenFS } from '@yarnpkg/libzip'
import type { MaybePromise } from 'rollup'

type WasmModuleOrPath =
	| string
	| MaybePromise<Response | BufferSource>
	| undefined

/** wasm-bindgen plugin module interface */
interface WasmBindgenPlugin {
	default: (
		wasmUrl?: { module_or_path: WasmModuleOrPath } | WasmModuleOrPath,
	) => Promise<void>
	language_id: () => string
	injection_languages: () => string[]
	create_session: () => number
	free_session: (session: number) => void
	set_text: (session: number, text: string) => void
	parse: (session: number) => ParseResult
	cancel: (session: number) => void
}

/** A loaded grammar plugin */
interface GrammarPlugin {
	languageId: string
	injectionLanguages: string[]
	module: WasmBindgenPlugin
	parse: (text: string) => ParseResult
}

const GRAMMAR_CACHE = new Map<string, GrammarPlugin>()

const fs = new PosixFS(
	new VirtualFS({
		baseFs: new ZipOpenFS({
			useCache: true,
			maxOpenFiles: 80,
		}),
	}),
)

async function loadGrammar(language: string): Promise<GrammarPlugin> {
	const cached = GRAMMAR_CACHE.get(language)
	if (cached) return cached

	const module = (await import(
		`@arborium/${language}/grammar.js`
	)) as WasmBindgenPlugin
	const wasmUrl = new URL(
		import.meta.resolve(`@arborium/${language}/grammar_bg.wasm`),
	)
	const buf = await fs.readFilePromise(wasmUrl.pathname)
	await module.default({ module_or_path: buf })

	// verify
	const loadedId = module.language_id()
	if (loadedId !== language) {
		console.warn(
			`[arborium] Language ID mismatch: expected '${language}', got '${loadedId}'`,
		)
	}

	const injectionLanguages = module.injection_languages()

	const plugin: GrammarPlugin = {
		languageId: language,
		injectionLanguages,
		module,
		parse: (text: string) => {
			const session = module.create_session()
			try {
				module.set_text(session, text)
				// wasm-bindgen returns ParseResult directly (or throws on error)
				const result = module.parse(session)
				return {
					spans: result.spans || [],
					injections: result.injections || [],
				}
			} finally {
				module.free_session(session)
			}
		},
	}

	GRAMMAR_CACHE.set(language, plugin)
	return plugin
}

export default async function highlightCode(
	code: string,
	lang: string,
): Promise<ParseResult> {
	const grammar = await loadGrammar(lang)
	if (!grammar) throw new Error(`Unknown language: ${lang}`)
	return grammar.parse(code)
}
