import * as fs from 'node:fs'
import { RollupOptions } from 'rollup'
import replace from '@rollup/plugin-replace'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import copy from 'rollup-plugin-copy'
import analyze from 'rollup-plugin-analyzer'
import typescript from '@rollup/plugin-typescript'
import postcss from 'rollup-plugin-postcss-modules'
import serve from 'rollup-plugin-serve'
import html, { makeHtmlAttributes, RollupHtmlTemplateOptions } from '@rollup/plugin-html'

// import * as autoprefixer from 'autoprefixer'

import renderdoc from './src/build-tools/rollup-plugin-renderdoc'
import * as urls from './src/build-tools/urls.js'

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

	const reactTag = {
		production: 'production.min',
		development: 'development',
	}[getNodeEnv()]

	return `\
<!doctype html>
<html${makeHtmlAttributes(html)}>
<head>

${metas}
<title>${title}</title>

<script src="${urls.get('react', '18.2.0', `umd/react.${reactTag}.js`)}"></script>
<script src="${urls.get('react-dom', '18.2.0', `umd/react-dom.${reactTag}.js`)}"></script>
<script src="${urls.get('plotly.js', '2.16.3', 'plotly.min.js')}"></script>
<script src="${urls.prism('prism.min.js')}"></script>
<script src="${urls.get('KaTeX', '0.16.3', 'katex.min.js')}"></script>
${scripts}

<link rel=stylesheet href="https://unpkg.com/katex@0.10/dist/katex.min.css">
<link rel="shortcut icon" href="${publicPath}static/gooball.svg">
${links}

</head>
<body>

<body id=main></body>
</body>
</html>
`
}

const conf: RollupOptions = {
	input: 'src/index.tsx',
	output: {
		file: 'dist/bundle.js',
		format: 'iife',
		sourcemap: true,
		globals: {
			react: 'React',
			'react-dom': 'ReactDOM',
			'plotly.js': 'Plotly',
			'plotly.js/dist/plotly': 'Plotly',
			prismjs: 'Prism',
			katex: 'katex',
		},
	},
	treeshake: { moduleSideEffects: false },
	watch: {
		include: ['src/**'],
	},
	external: ['react', 'react-dom', 'plotly.js', 'plotly.js/dist/plotly', 'prismjs', 'katex'],
	plugins: [
		analyze({
			writeTo(formatted) {
				// eslint-disable-next-line no-console
				fs.writeFile('dist/bundle.log', formatted, (e) => e !== null && console.error(e))
			},
		}),
		postcss({
			extract: true,
			sourceMap: true,
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
				contentBase: ['./dist', '.'],
				historyApiFallback: true,
			}),
		] : [],
	],
}

export default conf
