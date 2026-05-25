import {
	type ArboriumConfig,
	loadGrammar,
	type Utf16ParseResult,
} from '@arborium/arborium'
import { PosixFS, VirtualFS } from '@yarnpkg/fslib'
import { ZipOpenFS } from '@yarnpkg/libzip'

const fs = new PosixFS(
	new VirtualFS({
		baseFs: new ZipOpenFS({
			useCache: true,
			maxOpenFiles: 80,
		}),
	}),
)

const config: ArboriumConfig = {
	resolveJs({ language, path }) {
		return import(`@arborium/${language}/${path}`)
	},
	resolveWasm({ language, path }) {
		const wasmUrl = new URL(
			import.meta.resolve(`@arborium/${language}/${path}`),
		)
		return fs.readFilePromise(wasmUrl.pathname)
	},
}

export default async function highlightCode(
	code: string,
	lang: string,
	configOverride: ArboriumConfig = {},
): Promise<Utf16ParseResult> {
	const grammar = await loadGrammar(lang, { ...config, ...configOverride })
	if (!grammar) throw new Error(`Unknown language: ${lang}`)
	return grammar.parse(code)
}
