import { Helmet } from '@dr.pogodin/react-helmet'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import type { FC } from 'react'
import { Navigate, Route, useParams } from 'react-router'
import SlideRoutes from 'react-slide-routes'

import posts from '../../../posts'
import ListItemLink from '../../ListItemLink'
import Markup from '../../markup'

function date2url(date: Date) {
	return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

const Index = () => {
	const sorted = Object.entries(posts)
		.map(([slug, post]) => ({
			slug,
			post,
			date: post.date,
			url: `${date2url(post.date)}/${slug}`,
		}))
		.sort((a, b) => b.date.getTime() - a.date.getTime())
	return (
		<Grid container justifyContent="center">
			<List component="nav">
				{sorted.map(({ post, date, url }) => (
					<ListItemLink
						key={url}
						to={url}
						primary={post.document.title}
						secondary={date.toISOString().slice(0, 10)}
					/>
				))}
			</List>
		</Grid>
	)
}

const RoutedPost: FC = () => {
	const match = useParams<'id' | 'year' | 'month' | 'day'>()
	const { id, year, month, day } = match as Record<keyof typeof match, string>
	const post = posts[id]
	if (!post) {
		return <div>{`404 – post ${id} not found`}</div>
	}
	const { date, document } = post
	if (
		+year !== date.getFullYear() ||
		+month !== date.getMonth() + 1 ||
		+day !== date.getDate()
	) {
		return <Navigate replace to={`./../../../../${date2url(date)}/${id}`} />
	}
	return (
		<>
			<Helmet>
				<title>
					{document.title}
					{' – '}
					Blog – phil.red
				</title>
			</Helmet>
			<Markup doc={document} />
		</>
	)
}

const Blog = () => (
	<>
		<Helmet>
			<title>Blog – phil.red</title>
		</Helmet>
		<SlideRoutes animation="vertical-slide">
			<Route index element={<Index />} />
			<Route path=":year/:month/:day/:id" element={<RoutedPost />} />
			<Route path="*" element={<Navigate replace to="." />} />
		</SlideRoutes>
	</>
)

export default Blog
