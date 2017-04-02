import fs from 'fs'
import path from 'path'

import camelcase from 'camelcase'

import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs    from 'rollup-plugin-commonjs'
import typescript  from 'rollup-plugin-typescript2'
import postcss     from 'rollup-plugin-postcss'

import autoprefixer   from 'autoprefixer'
import postcssModules from 'postcss-modules'

const cssExports = {}

function getCSSExportDefinition(base, names) {
	const name = camelcase(base)
	return `\
declare namespace ${name} {
	${names.map(t => `const ${t}: string`).join('\n\t')}
}
export default ${name}`
}

export default {
	entry: 'src/index.tsx',
	dest: 'dist/bundle.js',
	format: 'iife',
	plugins: [
		postcss({
			plugins: [
				autoprefixer(),
				postcssModules({
					getJSON(id, exportTokens) {
						const d = getCSSExportDefinition(path.basename(id, '.css'), Object.keys(exportTokens))
						fs.writeFile(`${id}.d.ts`, `${d}\n`, () => console.log(`${id}.d.ts written`))
						
						cssExports[id] = exportTokens
					}
				}),
			],
			getExport(id) {
				return cssExports[id]
			},
		}),
		typescript(),
		nodeResolve(),
		commonjs({
			namedExports: {
				'node_modules/react/react.js': ['createElement', 'Component'],
				'node_modules/react-dom/index.js': ['render'],
			},
		}),
	],
}
