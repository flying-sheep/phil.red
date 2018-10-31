import rawPosts from './markup'
import Post from '../components/Blog/Post'

const posts = Object.entries(rawPosts)
	.reduce((obj, [filename, markup]) => {
		// @ts-ignore: _ is the filename again
		const [_, y, m, d, slug, format] = /(\d{4})-(\d{2})-(\d{2})-(.+)\.(rst|md)/.exec(filename) as RegExpExecArray
		obj[slug] = new Post(
			new Date(+y, +m - 1, +d),
			markup,
			format as 'md' | 'rst',
		)
		return obj
	}, {} as { [key: string ]: Post})

export default posts
