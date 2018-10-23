import * as React from 'react'
import {
	RouteComponentProps,
	Route, Switch,
} from 'react-router-dom'
import { List } from '@material-ui/core'

import Post from './Post'
import posts from '../../posts'
import ListItemLink from '../ListItemLink'


function Index({ match }: RouteComponentProps) {
	return (
		<List component="nav">
			{Object.keys(posts).map((filename) => {
				const title = filename.replace(/\.[^./]+$/, '')
				return (
					<ListItemLink
						to={`${match.url}/${title}`}
						primary={<Post id={title} justTitle/>}
					/>
				)
			})}
		</List>
	)
}

function RoutedPost({ match }: RouteComponentProps<{id: string}>) {
	return <Post id={match.params.id}/>
}

export default function Blog({ match }: RouteComponentProps) {
	return (
		<Switch>
			<Route path={`${match.url}/`} exact component={Index}/>
			<Route path={`${match.url}/:id`} component={RoutedPost}/>
		</Switch>
	)
}
