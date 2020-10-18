import * as React from 'react'
import { RouteComponentProps } from 'react-router-dom'

import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) => createStyles({
	box: {
		marginBlock: `${theme.spacing(4)}px`,
	},
}))

export default function Home({ match, ...props }: RouteComponentProps) {
	const classes = useStyles(props)
	return (
		// TODO: fix route
		<Container maxWidth="sm">
			<Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
				phil.red
			</Typography>
			<Typography variant="h5" align="center" color="textSecondary" paragraph className={classes.box}>
				programming, science, emancipation
			</Typography>
			<Typography variant="h6" align="center" paragraph>
				What software won’t sell you out?
				<br/>
				When do we get full automation and eternal life?
				<br/>
				Why are people blaming immigrants, not capitalism?
			</Typography>
			<Typography variant="h6" align="center" paragraph>
				I won’t be the one fix those questions.
				<br/>
				Currently most progress happens for the first.
				<br/>
				But I will never stop living for all.
			</Typography>
		</Container>
		// <CardMedia image={firstPost.image} title={post.imageTitle} />
	)
}
