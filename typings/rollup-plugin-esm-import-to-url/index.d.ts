declare module 'rollup-plugin-esm-import-to-url' {
	import { Plugin } from 'rollup'
	
	export interface ESMImportToURLOptions {
		imports?: Record<string, string>
	}
	
	export default function esmImportToUrl(opts: ESMImportToURLOptions): Plugin
}
