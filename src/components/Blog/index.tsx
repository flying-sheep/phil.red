import * as React from 'react'
import {
	RouteComponentProps,
	Route, Switch,
} from 'react-router-dom'
import { List } from '@material-ui/core'

import posts from '../../posts'
import ListItemLink from '../ListItemLink'


function Index({ match }: RouteComponentProps) {
	return (
		<List component="nav">
			{Object.entries(posts).map(([slug, post]) => {
				const { date } = post
				return (
					<ListItemLink
						to={`${match.url}/${date.getFullYear()}/${date.getMonth()}/${date.getDay()}/${slug}`}
						primary={post.title}
					/>
				)
			})}
		</List>
	)
}

function RoutedPost({ match }: RouteComponentProps<{id: string}>): React.ReactElement<any> {
	const { id } = match.params
	if (!(id in posts)) {
		return <div>{`404 – post ${id} not found`}</div>
	}
	return posts[id].element
}

export default function Blog({ match }: RouteComponentProps) {
	return (
		<Switch>
			<Route path={`${match.url}/`} exact component={Index}/>
			<Route path={`${match.url}/:year/:month/:day/:id`} component={RoutedPost}/>
		</Switch>
	)
}
