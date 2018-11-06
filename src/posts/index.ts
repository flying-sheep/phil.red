import rawPosts from './markup'
import { Markdown, ReStructuredText } from '../components/markup'

export class Post {
	renderer: Markdown | ReStructuredText
	date: Date
	markup: string
	format: 'md' | 'rst'
	element: React.ReactElement<any>
	
	constructor(date: Date, markup: string, format: 'md' | 'rst') {
		this.date = date
		this.markup = markup
		this.format = format
		const Renderer = { md: Markdown, rst: ReStructuredText }[format]
		this.renderer = new Renderer(markup)
		this.element = this.renderer.render()
	}
}

const posts = Object.entries(rawPosts)
	.reduce((obj, [filename, markup]) => {
		const [, y, m, d, slug, format] = /(\d{4})-(\d{2})-(\d{2})-(.+)\.(rst|md)/.exec(filename) as RegExpExecArray
		obj[slug] = new Post(
			new Date(+y, +m - 1, +d),
			markup,
			format as 'md' | 'rst',
		)
		return obj
	}, {} as { [key: string ]: Post})

export default posts
