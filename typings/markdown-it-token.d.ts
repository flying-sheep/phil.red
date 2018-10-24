declare module 'markdown-it/lib/token' {
	import * as MarkdownIt from 'markdown-it'
	
	class Token {
		// interface wrongly defines new(...), not constructor(...)
		constructor(type: string, tag: string, nesting: number)
	}
	interface Token extends MarkdownIt.Token {
	}
	
	export type TokenType = (
		'inline' |
		'text' |
		'paragraph' |
		'heading' |
		'link' |
		'hardbreak' |
		'softbreak' |
		'code_inline' |
		'fence' |
		'bullet_list' |
		'list_item'
	)
	export default Token
}
