import * as React from 'react'

import { Markdown, ReStructuredText } from '../../markup'

export default class Post {
	title: string
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
		try {
			this.title = this.renderer.getTitle()
		} catch (e) {
			this.title = e.toString()
		}
		this.element = this.renderer.render()
	}
}
