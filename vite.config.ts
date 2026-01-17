import react from '@vitejs/plugin-react'
import unfonts from 'unplugin-fonts/vite'
import { defineConfig } from 'vite'

import renderdoc from './src/build-tools/rollup-plugin-renderdoc.js'

// arborium uses this
console.debug = () => {}

// https://vitejs.dev/config/
export default defineConfig({
	assetsInclude: ['**/*.py'],
	resolve: {
		// remove legacy browser support with mui-modern
		conditions: ['mui-modern', 'module', 'browser', 'development|production'],
	},
	plugins: [
		react(),
		renderdoc({
			include: '*.@(md|rst)',
		}),
		unfonts({
			fontsource: {
				families: [
					{
						name: 'Iosevka Aile',
						// Needed weights: https://mui.com/material-ui/react-typography/
						weights: [300, 400, 500, 700],
					},
					{
						name: 'Iosevka',
						weights: [400, 700],
					},
				],
			},
		}),
	],
	build: { sourcemap: true },
	server: {
		fs: {
			// Otherwise problem with loading font files
			strict: false,
		},
	},
})
