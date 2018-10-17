import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'

import App from './components/App'

document.addEventListener('DOMContentLoaded', () => {
	ReactDOM.render(
		<Router>
			<><App/></>
		</Router>,
		document.querySelector('#main'),
	)
})
