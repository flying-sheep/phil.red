import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

const Home = () => (
	// TODO: fix route
	<Container maxWidth="sm">
		<Typography
			component="h1"
			variant="h2"
			align="center"
			color="textPrimary"
			gutterBottom
		>
			phil.red
		</Typography>
		<Typography
			variant="h5"
			align="center"
			color="textSecondary"
			paragraph
			sx={{ marginBlock: 4 }}
		>
			programming, science, emancipation
		</Typography>
		<Typography variant="h6" align="center" paragraph>
			What software won’t sell you out?
			<br />
			When do we get full automation and eternal life?
			<br />
			Why are people blaming immigrants, not capitalism?
		</Typography>
		<Typography variant="h6" align="center" paragraph>
			I won’t be the one to fix those questions.
			<br />
			Currently most progress happens for the first.
			<br />
			But I will never stop living for all.
		</Typography>
	</Container>
	// <CardMedia image={firstPost.image} title={post.imageTitle} />
)

export default Home
