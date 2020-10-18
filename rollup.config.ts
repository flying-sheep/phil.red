import * as replace from '@rollup/plugin-replace'
import nodeResolve from '@rollup/plugin-node-resolve'
import * as commonjs from '@rollup/plugin-commonjs'
import * as json from '@rollup/plugin-json'
import analyze from 'rollup-plugin-analyzer'
import * as builtins from 'rollup-plugin-node-builtins'
// import * as typescript from '@wessberg/rollup-plugin-ts'
import * as typescript from '@rollup/plugin-typescript'
import postcss from 'rollup-plugin-postcss-modules'
import * as serve from 'rollup-plugin-serve'

// import * as autoprefixer from 'autoprefixer'

import renderdoc from './src/build-tools/rollup-plugin-renderdoc'

const NODE_ENV = process.env.NODE_ENV || 'development'
const isDev = NODE_ENV === 'development'
const isWatching = process.env.ROLLUP_WATCH === 'true'

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
			'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
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
		...(isDev && isWatching) ? [
			(serve as unknown as (o?: any) => Plugin)({
				contentBase: '.',
				historyApiFallback: true,
			}),
		] : [],
	],
}
