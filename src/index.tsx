import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'

import App from './components/App'

document.addEventListener('DOMContentLoaded', () => {
	(window as any).__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true
	ReactDOM.render(
		<Router>
			<App/>
		</Router>,
		document.querySelector('#main'),
	)
})
