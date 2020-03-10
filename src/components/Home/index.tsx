import * as React from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'

import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

import posts from '../../posts'
import { postURL } from '../Blog'

const useStyles = makeStyles((theme: Theme) => createStyles({
	box: {
		marginBlock: `${theme.spacing(4)}px`,
	},
}))

const [firstSlug, firstPost] = (
	Object.entries(posts).sort(
		(a, b) => b[1].date.getTime() - a[1].date.getTime(),
	)[0]
)
const firstURL = postURL(firstPost.date, firstSlug)

export default function Home({ match, ...props }: RouteComponentProps) {
	const classes = useStyles(props)
	return (
		// TODO: fix route
		<Container maxWidth="sm">
			<Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
				phil.red
			</Typography>
			<Typography variant="h5" align="center" color="textSecondary" paragraph className={classes.box}>
				coder, computational biologist, anarchist.
				<br/>
				check out my newest rant about
			</Typography>
			<CardActionArea component={Link} to={`/blog/${firstURL}`}>
				<Card>
					<CardContent>
						<Typography variant="h3">
							{firstPost.renderer.getTitle()}
						</Typography>
						<Typography variant="subtitle1">
							{firstPost.date.toISOString().substr(0, 10)}
						</Typography>
					</CardContent>
				</Card>
			</CardActionArea>
		</Container>
		// <CardMedia image={firstPost.image} title={post.imageTitle} />
	)
}
