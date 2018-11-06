/* eslint import/no-extraneous-dependencies: [1, { devDependencies: true }], no-console: 0 */

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

export default {
	input: 'src/index.tsx',
	output: {
		file: 'dist/bundle.js',
		format: 'iife',
		sourcemap: true,
	},
	plugins: [
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
		conditional(NODE_ENV === 'development', () => [
			serve({
				contentBase: '.',
				historyApiFallback: true,
			}),
		]),
	],
}
