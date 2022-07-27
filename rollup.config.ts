import { RollupOptions } from 'rollup'
import replace from '@rollup/plugin-replace'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import copy from 'rollup-plugin-copy'
import esmImportToUrl from 'rollup-plugin-esm-import-to-url'
import analyze from 'rollup-plugin-analyzer'
import builtins from 'rollup-plugin-node-builtins'
import typescript from '@rollup/plugin-typescript'
import postcss from 'rollup-plugin-postcss-modules'
import serve from 'rollup-plugin-serve'
import html, { makeHtmlAttributes, RollupHtmlTemplateOptions } from '@rollup/plugin-html'

// import * as autoprefixer from 'autoprefixer'

import renderdoc from './src/build-tools/rollup-plugin-renderdoc'

function getNodeEnv(): 'production' | 'development' {
	const e = process.env.NODE_ENV || 'development'
	if (e !== 'production' && e !== 'development') {
		throw new Error(`Unknown environment ${e}`)
	}
	return e
}

const isDev = getNodeEnv() === 'development'
const isWatching = process.env.ROLLUP_WATCH === 'true'

function template(options?: RollupHtmlTemplateOptions | undefined): string {
	const {
		title = null,
		meta = [],
		attributes: { script = {}, link = {}, html = {} } = {},
		// bundle,
		files: { js = [], css = [] } = {},
		publicPath,
	} = options ?? {}
	
	const scripts = js
		.map(({ fileName }) => {
			const attrs = makeHtmlAttributes(script)
			return `<script src="${publicPath}${fileName}"${attrs}></script>`
		})
		.join('\n')

	const links = css
		.map(({ fileName }) => {
			const attrs = makeHtmlAttributes(link)
			return `<link href="${publicPath}${fileName}" rel="stylesheet"${attrs}>`
		})
		.join('\n')

	const metas = meta
		.map((input) => `<meta${makeHtmlAttributes(input)}>`)
		.join('\n')

	return `\
<!doctype html>
<html${makeHtmlAttributes(html)}>
<head>

${metas}
<title>${title}</title>

${scripts}

<link rel=stylesheet href="https://esm.sh/katex@0.12.0/dist/katex.min.css">
${links}

</head>
<body>

<body id=main></body>
</body>
</html>
`
}

/*
const reactTag = {
	production: 'production.min',
	development: 'development',
}[getNodeEnv()]
*/

const conf: RollupOptions = {
	input: 'src/index.tsx',
	output: {
		file: 'dist/bundle.js',
		format: 'es',
		sourcemap: true,
	},
	treeshake: { moduleSideEffects: false },
	watch: {
		include: ['src/**'],
	},
	plugins: [
		analyze({
			writeTo(formatted) {
				// eslint-disable-next-line global-require,no-console
				require('fs').writeFile('dist/bundle.log', formatted, (e: Error) => (e !== null ? console.error(e) : {}))
			},
		}),
		esmImportToUrl({
			imports: {
				react: 'https://esm.sh/react@18?target=es2020',
				'react-dom': 'https://esm.sh/react-dom@18?target=es2020',
				'plotly.js': 'https://esm.sh/plotly.js@1?target=es2020',
				'plotly.js/dist/plotly': 'https://esm.sh/plotly.js@1?target=es2020',
				katex: 'https://esm.sh/katex@0.12?target=es2020',
			},
		}),
		postcss({
			extract: true,
			sourceMap: true,
			writeDefinitions: true,
			plugins: [
				// autoprefixer(),
			],
		}),
		replace({
			'process.env.NODE_ENV': JSON.stringify(getNodeEnv()),
			'process.env.MUI_SUPPRESS_DEPRECATION_WARNINGS': JSON.stringify(false),
			preventAssignment: true,
		}),
		typescript(),
		nodeResolve({
			preferBuiltins: true,
			mainFields: ['module', 'main'],
			// 'node_modules/@emotion/unitless/dist/unitless.cjs.dev.js'
		}),
		commonjs(),
		builtins(),
		json(),
		renderdoc({
			include: '*.@(md|rst)',
		}),
		html({
			template,
			title: 'phil.red',
			fileName: 'index.html',
			meta: [
				{ charset: 'utf-8' },
				{ name: 'color-scheme', content: 'dark light' },
				{ name: 'viewport', content: 'minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no' },
			],
			publicPath: '/',
		}),
		copy({
			targets: [
				{ src: 'lighttpd.conf', dest: 'dist' },
				{ src: 'static', dest: 'dist' },
			],
		}),
		...(isDev && isWatching) ? [
			serve({
				contentBase: './dist',
				historyApiFallback: true,
			}),
		] : [],
	],
}

export default conf
