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
	const titles = Object.keys(posts)
		.map(filename => filename.replace(/\.[^./]+$/, ''))
	return (
		<List component="nav">
			{titles.map(title => (
				<ListItemLink to={`${match.url}/${title}`} primary={title}/>
			))}
		</List>
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
