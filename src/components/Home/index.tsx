import * as React from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import {
	Card, CardActionArea, CardContent, Typography,
} from '@material-ui/core'

import posts from '../../posts'
import { postURL } from '../Blog'

const [firstSlug, firstPost] = (
	Object.entries(posts).sort(
		(a, b) => b[1].date.getTime() - a[1].date.getTime()
	)[0]
)
const firstURL = postURL(firstPost.date, firstSlug)

export default function Home({ match }: RouteComponentProps) {
	return (
		// TODO: fix route
		<>
			<Typography paragraph>newest post:</Typography>
			<CardActionArea component={Link} to={`/blog/${firstURL}`}>
				<Card>
					<CardContent>
						<Typography variant="h3">{firstPost.renderer.getTitle()}</Typography>
					</CardContent>
				</Card>
			</CardActionArea>
		</>
		// <CardMedia image={firstPost.image} title={post.imageTitle} />
	)
}
