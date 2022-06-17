import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter as Router } from 'react-router-dom'

import App from './components/App'

document.addEventListener('DOMContentLoaded', () => {
	const root = createRoot(document.querySelector('#main')!)
	root.render(
		<StrictMode>
			<HelmetProvider>
				<Router>
					<App/>
				</Router>
			</HelmetProvider>
		</StrictMode>,
	)
})
