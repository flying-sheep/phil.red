import * as React from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import {
	Card, CardActionArea, CardContent, Container, Typography,
} from '@material-ui/core'

import posts from '../../posts'
import { postURL } from '../Blog'

const [firstSlug, firstPost] = (
	Object.entries(posts).sort(
		(a, b) => b[1].date.getTime() - a[1].date.getTime(),
	)[0]
)
const firstURL = postURL(firstPost.date, firstSlug)

export default function Home({ match }: RouteComponentProps) {
	return (
		// TODO: fix route
		<Container maxWidth="sm">
			<Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
				phil.red
			</Typography>
			<Typography variant="h5" align="center" color="textSecondary" paragraph>
				coder, computational biologist, anarchist.
				<br/>
				check out my newest rant about
			</Typography>
			<CardActionArea component={Link} to={`/blog/${firstURL}`}>
				<Card>
					<CardContent>
						<Typography variant="h3">{firstPost.renderer.getTitle()}</Typography>
						<Typography variant="subtitle1">{firstPost.date.toISOString().substr(0, 10)}</Typography>
					</CardContent>
				</Card>
			</CardActionArea>
		</Container>
		// <CardMedia image={firstPost.image} title={post.imageTitle} />
	)
}
