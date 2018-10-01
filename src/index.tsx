import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'

import App from './App'

document.addEventListener('DOMContentLoaded', () => {
	ReactDOM.render(
		<Router>
			<div>
				<App/>
			</div>
		</Router>,
		document.querySelector('#main'),
	)
})
