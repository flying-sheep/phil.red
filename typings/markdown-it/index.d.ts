// Hack waiting for 14.0 release of https://www.npmjs.com/package/@types/markdown-it
declare module 'markdown-it/lib/token.mjs' {
	import Token from 'markdown-it/lib/token.js'

	export = Token
}
