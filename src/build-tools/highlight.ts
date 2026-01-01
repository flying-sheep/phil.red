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

type WbgInitInput =
	| RequestInfo
	| URL
	| Response
	| BufferSource
	| WebAssembly.Module

/** wasm-bindgen plugin module interface */
interface WasmBindgenPlugin {
	default: (
		module_or_path?:
			| { module_or_path: MaybePromise<WbgInitInput> }
			| MaybePromise<WbgInitInput>
			| undefined,
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
class GrammarPlugin {
	constructor(public module: WasmBindgenPlugin) {}
	parse(text: string): ParseResult {
		const session = this.module.create_session()
		try {
			this.module.set_text(session, text)
			// wasm-bindgen returns ParseResult directly (or throws on error)
			const result = this.module.parse(session)
			return {
				spans: result.spans || [],
				injections: result.injections || [],
			}
		} finally {
			this.module.free_session(session)
		}
	}
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

	const plugin = new GrammarPlugin(module)
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
