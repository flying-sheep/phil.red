import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'

import App from './components/App'

document.addEventListener('DOMContentLoaded', () => {
	const root = createRoot(document.querySelector('#main')!)
	root.render(<StrictMode><Router><App/></Router></StrictMode>)
})
