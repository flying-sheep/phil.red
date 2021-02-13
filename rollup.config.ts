import * as replace from '@rollup/plugin-replace'
import nodeResolve from '@rollup/plugin-node-resolve'
import * as commonjs from '@rollup/plugin-commonjs'
import * as json from '@rollup/plugin-json'
import * as copy from 'rollup-plugin-copy'
import analyze from 'rollup-plugin-analyzer'
import * as builtins from 'rollup-plugin-node-builtins'
// import * as typescript from '@wessberg/rollup-plugin-ts'
import * as typescript from '@rollup/plugin-typescript'
import postcss from 'rollup-plugin-postcss-modules'
import * as serve from 'rollup-plugin-serve'
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

function template({
	title,
	meta,
	attributes,
	// bundle,
	files,
	publicPath,
}: RollupHtmlTemplateOptions) {
	const scripts = (files.js || [])
		.map(({ fileName }) => {
			const attrs = makeHtmlAttributes(attributes.script)
			return `<script src="${publicPath}${fileName}"${attrs}></script>`
		})
		.join('\n')

	const links = (files.css || [])
		.map(({ fileName }) => {
			const attrs = makeHtmlAttributes(attributes.link)
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
<html${makeHtmlAttributes(attributes.html)}>
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
			'plotly.js/dist/plotly': 'Plotly',
			katex: 'katex',
		},
	},
	treeshake: { moduleSideEffects: false },
	watch: {
		include: ['src/**'],
	},
	external: ['react', 'react-dom', 'plotly.js', 'plotly.js/dist/plotly', 'katex'],
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
		(replace as unknown as (options?: replace.RollupReplaceOptions) => Plugin)({
			'process.env.NODE_ENV': JSON.stringify(getNodeEnv()),
			'process.env.MUI_SUPPRESS_DEPRECATION_WARNINGS': JSON.stringify(false),
		}),
		(typescript as unknown as (options?: typescript.RollupTypescriptOptions) => Plugin)(),
		nodeResolve({
			preferBuiltins: true,
		}),
		(commonjs as unknown as (o?: commonjs.RollupCommonJSOptions) => Plugin)(),
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
		(copy as unknown as (o: copy.CopyOptions) => Plugin)({
			targets: [
				{ src: 'lighttpd.conf', dest: 'dist' },
				{ src: 'static', dest: 'dist' },
			],
		}),
		...(isDev && isWatching) ? [
			(serve as unknown as (o?: any) => Plugin)({
				contentBase: '.',
				historyApiFallback: true,
			}),
		] : [],
	],
}
