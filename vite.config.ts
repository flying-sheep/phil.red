/* eslint import/no-extraneous-dependencies: ['error', {devDependencies: true}] */
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import renderdoc from './src/build-tools/rollup-plugin-renderdoc.js'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		renderdoc({
			include: '*.@(md|rst)',
		}),
	],
})
