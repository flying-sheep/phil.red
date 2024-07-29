/// <reference types="vite/client" />
/// <reference types="@total-typescript/ts-reset" />
/// <reference types="unplugin-fonts/client" />

import 'unfonts.css'
import './main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter as Router } from 'react-router-dom'

import App from './components/routes/App'

document.addEventListener('DOMContentLoaded', () => {
	const elem = document.querySelector('#root')
	if (!elem) throw new Error('No #root element found')
	const root = createRoot(elem)
	root.render(
		<StrictMode>
			<HelmetProvider>
				<Router>
					<App />
				</Router>
			</HelmetProvider>
		</StrictMode>,
	)
})
