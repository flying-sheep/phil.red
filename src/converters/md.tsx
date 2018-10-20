import * as React from 'react'

import * as MarkdownIt from 'markdown-it'


export default function mdConvert(code: string): React.ReactElement<{}> {
	const md = new MarkdownIt()
	const nodes = md.parse(code, {})
	return <>{JSON.stringify(nodes)}</>
}
