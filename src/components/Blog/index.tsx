import * as React from 'react'
import {
	RouteComponentProps,
	Route, Switch, Link,
} from 'react-router-dom'

import Post from './Post'
import posts from '../../posts'

function Index({ match }: RouteComponentProps) {
	return (
		<ul>
			{Object.keys(posts).map(filename => (
				<li>
					<Link to={`${match.url}/example`}>{filename}</Link>
				</li>
			))}
		</ul>
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
