import {
	type ArboriumConfig,
	loadGrammar,
	type ParseResult as Utf16ParseResult,
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

const debugOrig = console.debug
const debugSilent = () => {}

export default async function highlightCode(
	code: string,
	lang: string,
): Promise<Utf16ParseResult> {
	console.debug = debugSilent
	const grammar = await loadGrammar(lang, config)
	console.debug = debugOrig
	if (!grammar) throw new Error(`Unknown language: ${lang}`)
	return grammar.parse(code)
}
