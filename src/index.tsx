import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import CatchError from 'react-did-catch'

import App from './components/App'

document.addEventListener('DOMContentLoaded', () => {
	(window as any).__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true
	ReactDOM.render(
		<Router>
			<CatchError>
				<App/>
			</CatchError>
		</Router>,
		document.querySelector('#main'),
	)
})
