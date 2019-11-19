/* eslint import/no-extraneous-dependencies: [1, { devDependencies: true }], no-console: 0 */

import { plugin as analyze } from 'https://unpkg.com/rollup-plugin-analyzer@3.2'
import replace from 'https://unpkg.com/rollup-plugin-replace@2.2'
import nodeResolve from 'https://unpkg.com/rollup-plugin-node-resolve@5.2'
import commonjs from 'https://unpkg.com/rollup-plugin-commonjs@10.1'
import builtins from 'https://unpkg.com/rollup-plugin-node-builtins@2.1'
import json from 'https://unpkg.com/rollup-plugin-json@4.0'
import typescript from 'https://unpkg.com/@wessberg/rollup-plugin-ts@1.1'
import postcss from 'https://unpkg.com/rollup-plugin-postcss-modules@2.0'
import serve from 'https://unpkg.com/rollup-plugin-serve@1.0'
import conditional from 'https://unpkg.com/rollup-plugin-conditional@3.1'

import autoprefixer from 'https://unpkg.com/autoprefixer@9.6'

import textdir from './rollup-plugin-textdir.ts'

const NODE_ENV = process.env.NODE_ENV || 'development'
const isDev = NODE_ENV === 'development'

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
				const encoder = new TextEncoder()
				Deno.writeFile('dist/bundle.log', encoder.encode(formatted)).then(e => (e !== null ? console.error(e): {}))
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
		}),
		commonjs({ // https://github.com/rollup/rollup-plugin-commonjs/issues/185
			namedExports: {
				'node_modules/react/index.js': ['createElement', 'Component', 'Fragment'],
				'node_modules/react-dom/index.js': ['render'],
				'node_modules/@material-ui/core/styles/index.js': [
					'MuiThemeProvider',
					'createGenerateClassName',
					'createMuiTheme',
					'withTheme',
					'withStyles',
					'createStyles',
					'jssPreset',
				],
				'node_modules/@material-ui/core/Modal/index.js': ['ModalManager'],
				'node_modules/react-katex/dist/react-katex.js': ['InlineMath', 'DisplayMath'],
			},
		}),
		builtins(),
		json(),
		textdir({
			include: '*.@(md|rst)',
		}),
		conditional(isDev, () => [
			serve({
				contentBase: '.',
				historyApiFallback: true,
			}),
		]),
	],
}
