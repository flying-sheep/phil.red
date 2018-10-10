import * as React from 'react'
import { Route, Switch, Link, RouteComponentProps } from 'react-router-dom'

import Post from './Post'

function Index({ match }: RouteComponentProps) {
	return (
		<Link to={`${match.url}/example`}>Example</Link>
	)
}

export default function Blog({ match }: RouteComponentProps) {
	return (
		<Switch>
			<Route path={`${match.url}/`} exact component={Index}/>
			<Route path={`${match.url}/:id`} component={Post}/>
		</Switch>
	)
}
