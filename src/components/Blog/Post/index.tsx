import * as React from 'react'

import posts from '../../../posts'
import { Markdown, ReStructuredText } from '../../markup'

export interface PostProps {
	id: string
	justTitle?: boolean
}

export default function Post({ id, justTitle = false }: PostProps) {
	const candidates = Object.keys(posts).filter(slug => slug.startsWith(id))
	if (candidates.length === 0) {
		return <div>{`404 – post ${id} not found`}</div>
	}
	const filename = candidates[0]
	const postMarkup = posts[filename]
	const format = filename.split('.').pop()
	if (format !== 'md' && format !== 'rst') {
		return <article>{`Unknown format “${format}” of file ${filename}`}</article>
	}
	const Renderer = { md: Markdown, rst: ReStructuredText }[format]
	return <Renderer code={postMarkup} justTitle={justTitle}/>
}
