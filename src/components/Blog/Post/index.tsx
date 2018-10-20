import * as React from 'react'
import { RouteComponentProps } from 'react-router-dom'

import converters from '../../../converters'
import posts from '../../../posts'


export default function Post({ match }: RouteComponentProps<{id: string}>) {
	const candidates = Object.keys(posts).filter(title => title.startsWith(match.params.id))
	if (candidates.length === 0) {
		return <div>{`404 – post ${match.params.id} not found`}</div>
	}
	const filename = candidates[0]
	const postMarkup = posts[filename]
	const format = filename.split('.').pop() as ('rst' | 'md')
	const post = converters[format](postMarkup)
	return <article>{post}</article>
}
