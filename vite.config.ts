/* eslint import/no-extraneous-dependencies: ['error', {devDependencies: true}] */
import react from '@vitejs/plugin-react'
import unfonts from 'unplugin-fonts/vite'
import { defineConfig } from 'vite'

import renderdoc from './src/build-tools/rollup-plugin-renderdoc.js'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		renderdoc({
			include: '*.@(md|rst)',
		}),
		unfonts({
			fontsource: {
				families: [
					{
						name: 'IBM Plex Sans',
						// Needed weights: https://mui.com/material-ui/react-typography/
						weights: [300, 400, 500, 700],
						subset: 'latin-ext',
					},
					{
						name: 'IBM Plex Mono',
						weights: [400, 700],
						subset: 'latin-ext',
					},
				],
			},
		}),
	],
	server: {
		fs: {
			// Otherwise problem with loading font files
			strict: false,
		},
	},
})
