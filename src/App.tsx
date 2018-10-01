import * as React from 'react'
import { Route, Link } from 'react-router-dom'

import Post from './components/Post'

export default function App() {
	return (
		<>
			<Link to="/blog">Blog</Link>
			<Route path="/blog" component={Post}/>
		</>
	)
}
