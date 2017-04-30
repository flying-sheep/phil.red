/* eslint import/no-extraneous-dependencies: [1, { devDependencies: true }], no-console: 0 */

import replace from 'rollup-plugin-replace'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import postcss from 'rollup-plugin-postcss-modules'

import autoprefixer from 'autoprefixer'

export default {
	entry: 'src/index.tsx',
	dest: 'dist/bundle.js',
	format: 'iife',
	sourceMap: true,
	plugins: [
		postcss({
			extract: true,
			sourceMap: true,
			plugins: [
				autoprefixer(),
			],
		}),
		replace({
			'process.env.NODE_ENV': JSON.stringify('production'),
		}),
		typescript(),
		nodeResolve(),
		commonjs({  // https://github.com/rollup/rollup-plugin-commonjs/issues/185
			namedExports: {
				'node_modules/react/react.js': ['createElement', 'Component'],
				'node_modules/react-dom/index.js': ['render'],
			},
		}),
	],
}
