import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

import renderdoc from './src/build-tools/rollup-plugin-renderdoc.js'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		renderdoc({
			include: '*.@(md|rst)',
		}),
		viteStaticCopy({
			targets: [
				{ src: 'lighttpd.conf', dest: '.' },
			],
		}),
	],
})
