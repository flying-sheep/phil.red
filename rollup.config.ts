import replace from '@rollup/plugin-replace'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import copy from 'rollup-plugin-copy'
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
	if (e !== 'production' && e !== 'development')
		throw new Error(`Unknown environment ${e}`)
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

<script src="https://unpkg.com/react@16/umd/react.${reactTag}.js"></script>
<script src="https://unpkg.com/react-dom@16/umd/react-dom.${reactTag}.js"></script>
<script src="https://unpkg.com/plotly.js@1/dist/plotly.min.js"></script>
<script src="https://unpkg.com/prismjs@1.22.0/prism.js"></script>
<script src="https://unpkg.com/katex@0.12/dist/katex.min.js"></script>
${scripts}

<link rel=stylesheet href="https://unpkg.com/katex@0.10/dist/katex.min.css">
${links}

</head>
<body>

<body id=main></body>
</body>
</html>
`
}

export default {
	input: 'src/index.tsx',
	output: {
		file: 'dist/bundle.js',
		format: 'iife',
		sourcemap: true,
		globals: {
			react: 'React',
			'react-dom': 'ReactDOM',
			'plotly.js': 'Plotly',
			katex: 'katex',
		},
	},
	treeshake: { moduleSideEffects: false },
	watch: {
		include: ['src/**'],
	},
	external: ['react', 'react-dom', 'plotly.js', 'katex'],
	plugins: [
		analyze({
			writeTo(formatted) {
				// eslint-disable-next-line global-require,no-console
				require('fs').writeFile('dist/bundle.log', formatted, (e: Error) => (e !== null ? console.error(e) : {}))
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
		}),
		commonjs(),
		builtins(),
		(json as unknown as () => Plugin)(),
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
				contentBase: '.',
				historyApiFallback: true,
			}),
		] : [],
	],
}
