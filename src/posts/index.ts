import { Document } from '../markup'

import rawPosts from './rawPosts'

export class Post {
	date: Date
	document: Document
	
	constructor(date: Date, document: Document) {
		this.date = date
		this.document = document
	}
}

const posts = Object.fromEntries(
	Object.entries(rawPosts).map(([filename, document]) => {
		const [, y, m, d, slug] = /(\d{4})-(\d{2})-(\d{2})-(.+)\.(rst|md)/.exec(filename) as RegExpExecArray
		const post = new Post(new Date(+y, +m - 1, +d), document)
		return [slug, post]
	}),
)

export default posts
