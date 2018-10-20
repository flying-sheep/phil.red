import * as React from 'react'
import {
	RouteComponentProps,
	Route, Switch, Link,
} from 'react-router-dom'

import Post from './Post'
import posts from '../../posts'

function Index({ match }: RouteComponentProps) {
	const titles = Object.keys(posts)
		.map(filename => filename.replace(/\.[^./]+$/, ''))
	return (
		<ul>
			{titles.map(title => (
				<li>
					<Link to={`${match.url}/${title}`}>{title}</Link>
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
