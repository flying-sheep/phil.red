import * as React from 'react'
import {
	RouteComponentProps,
	Route, Switch, Redirect,
} from 'react-router-dom'
import { List } from '@material-ui/core'

import posts from '../../posts'
import ListItemLink from '../ListItemLink'


function date2url(date: Date) {
	return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

function Index({ match }: RouteComponentProps) {
	return (
		<List component="nav">
			{Object.entries(posts).map(([slug, post]) => {
				const { date } = post
				return (
					<ListItemLink
						to={`${match.url}/${date2url(date)}/${slug}`}
						primary={post.renderer.title}
					/>
				)
			})}
		</List>
	)
}

interface PostProps {
	id: string
	year: string
	month: string
	day: string
}

function RoutedPost({ match }: RouteComponentProps<PostProps>): React.ReactElement<any> {
	const {
		id,
		year, month, day,
	} = match.params
	if (!(id in posts)) {
		return <div>{`404 – post ${id} not found`}</div>
	}
	const { date, element } = posts[id]
	if (+year !== date.getFullYear() || +month !== date.getMonth() + 1 || +day !== date.getDate()) {
		// TODO: after redirect, match.params stay the same!
		return <Redirect to={`${match.url}/../../../../${date2url(date)}/${id}`}/>
	}
	return element
}

export default function Blog({ match }: RouteComponentProps) {
	return (
		<Switch>
			<Route path={match.url} exact component={Index}/>
			<Route path={`${match.url}/:year/:month/:day/:id`} component={RoutedPost}/>
			<Redirect to={match.url}/>
		</Switch>
	)
}
