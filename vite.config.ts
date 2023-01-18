import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import renderdoc from './src/build-tools/rollup-plugin-renderdoc.js'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		/*
		renderdoc({
			include: '*.@(md|rst)',
		}),
		*/
	],
})
