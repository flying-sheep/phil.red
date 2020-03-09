/* eslint import/no-extraneous-dependencies: [1, { devDependencies: true }], no-console: 0 */

import fs from 'fs'

import { plugin as analyze } from 'rollup-plugin-analyzer'
import replace from 'rollup-plugin-replace'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import builtins from 'rollup-plugin-node-builtins'
import json from 'rollup-plugin-json'
import typescript from '@wessberg/rollup-plugin-ts'
import postcss from 'rollup-plugin-postcss-modules'
import serve from 'rollup-plugin-serve'
import conditional from 'rollup-plugin-conditional'

import autoprefixer from 'autoprefixer'

import textdir from './rollup-plugin-textdir.js'

const NODE_ENV = process.env.NODE_ENV || 'development'
const isDev = NODE_ENV === 'development'
const isWatching = process.env.ROLLUP_WATCH !== undefined

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
	watch: {
		include: ['src/**'],
	},
	external: ['react', 'react-dom', 'plotly.js', 'plotly.js/dist/plotly', 'katex'],
	plugins: [
		analyze({
			writeTo(formatted) {
				fs.writeFile('dist/bundle.log', formatted, e => (e !== null ? console.error(e) : {}))
			},
		}),
		postcss({
			extract: true,
			sourceMap: true,
			writeDefinitions: true,
			plugins: [
				autoprefixer(),
			],
		}),
		replace({
			'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
			'process.env.MUI_SUPPRESS_DEPRECATION_WARNINGS': JSON.stringify(false),
		}),
		typescript(),
		nodeResolve({
			preferBuiltins: true,
			customResolveOptions: {
				packageFilter(pkg, file) {
					return pkg
				},
			},
		}),
		commonjs({ // https://github.com/rollup/rollup-plugin-commonjs/issues/185
			namedExports: {
				'node_modules/react/index.js': ['createElement', 'Component', 'Fragment'],
				'node_modules/react-dom/index.js': ['render'],
				'node_modules/react-katex/dist/react-katex.js': ['InlineMath', 'DisplayMath'],
				'node_modules/react-router-dom/index.js': [
					'BrowserRouter',
					'Link',
					'Redirect',
					'Route',
					'RouteComponentProps',
					'Switch',
					'withRouter',
				],
				'node_modules/@material-ui/core/index.js': [
					'CardActionArea',
					'Card',
					'CardContent',
					'CardHeader',
					'List',
					'ListItem',
					'ListItemIcon',
					'ListItemText',
					'Typography',
				],
			},
		}),
		builtins(),
		json(),
		textdir({
			include: '*.@(md|rst)',
		}),
		conditional(isDev && isWatching, () => [
			serve({
				contentBase: '.',
				historyApiFallback: true,
			}),
		]),
	],
}
