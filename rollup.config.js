/* eslint import/no-extraneous-dependencies: [1, { devDependencies: true }], no-console: 0 */

import replace from 'rollup-plugin-replace'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import typescript from '@wessberg/rollup-plugin-ts'
import postcss from 'rollup-plugin-postcss-modules'
import serve from 'rollup-plugin-serve'

import autoprefixer from 'autoprefixer'

import textdir from './rollup-plugin-textdir.js'

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
			'process.env.NODE_ENV': JSON.stringify('production'),
			'process.env.MUI_SUPPRESS_DEPRECATION_WARNINGS': JSON.stringify(false),
		}),
		typescript(),
		nodeResolve(),
		commonjs({ // https://github.com/rollup/rollup-plugin-commonjs/issues/185
			namedExports: {
				'node_modules/react/index.js': ['createElement', 'Component', 'Fragment'],
				'node_modules/react-dom/index.js': ['render'],
				'node_modules/@material-ui/core/styles/index.js': ['withStyles', 'createStyles'],
			},
		}),
		textdir({
			include: '*.@(md|rst)',
		}),
		serve({
			contentBase: '.',
			historyApiFallback: true,
		}),
	],
}
