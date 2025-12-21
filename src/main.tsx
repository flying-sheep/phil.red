/// <reference types="vite/client" />
/// <reference types="@total-typescript/ts-reset" />
/// <reference types="unplugin-fonts/client" />
/// <reference types="@mui/material/themeCssVarsAugmentation" />

import 'unfonts.css'
import './main.css'

import { HelmetProvider } from '@dr.pogodin/react-helmet'
import { SnackbarProvider } from 'notistack'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router'

import App from './components/routes/App'

const elem = document.querySelector('#root')
if (!elem) throw new Error('No #root element found')
const root = createRoot(elem)
root.render(
	<StrictMode>
		<HelmetProvider>
			<SnackbarProvider autoHideDuration={3000}>
				<Router>
					<App />
				</Router>
			</SnackbarProvider>
		</HelmetProvider>
	</StrictMode>,
)
