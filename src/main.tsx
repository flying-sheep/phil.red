/// <reference types="vite/client" />
/// <reference types="@total-typescript/ts-reset" />
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter as Router } from 'react-router-dom'

import App from './components/App'

document.addEventListener('DOMContentLoaded', () => {
	const root = createRoot(document.querySelector('#root')!)
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
