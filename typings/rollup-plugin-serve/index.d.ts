declare module 'rollup-plugin-serve' {
	interface Config {
		/** Launch in browser (default: false) */
		open?: boolean
		/** Page to navigate to when opening the browser.
		 * Will not do anything if open=false.
		 * Remember to start with a slash.
		 */
		openPage?: string
		/** Show server address in console (default: true) */
		verbose?: boolean
		/** Folder(s) to serve files from */
		contentBase?: string | string[]
		/** Path to fallback page. true: index.html (200), false: error page (404) */
		historyApiFallback?: boolean | string
		/** Options used in setting up server () */
		host?: string
		/** Options used in setting up server */
		port?: 10001
		/** By default server will be served over HTTP (https: false).
		 *  It can optionally be served over HTTPS
		 */
		https?: false | { key: string, cert: string, ca: string }
		/** set headers */
		headers?: { [httpHeader: string]: string}
	}
	export default function serve(config: Config): void
}
