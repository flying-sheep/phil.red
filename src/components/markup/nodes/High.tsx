import type { SxProps } from '@mui/material'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import type { SystemStyleObject } from '@mui/system/styleFunctionSx'
import { mergeSx } from 'merge-sx'
import { Highlight, themes } from 'prism-react-renderer'
import Prism from 'prismjs'
import { type FC, useEffect, useState } from 'react'

import * as urls from '../../../build-tools/urls.js'
import CodeBlock from '../../CodeBlock.js'

const loadScriptNoCache = (url: string) =>
	new Promise<HTMLScriptElement>((resolve, reject) => {
		const script = document.createElement('script')
		script.src = url
		document.body.appendChild(script)
		script.onload = () => resolve(script)
		script.onerror = () => {
			document.body.removeChild(script)
			reject(`The script ${url} didn't load correctly.`)
		}
	})

const langCache = new Map<string, Promise<HTMLScriptElement>>()

async function loadScript(url: string): Promise<HTMLScriptElement> {
	let scriptPromise = langCache.get(url)
	if (!scriptPromise) {
		scriptPromise = loadScriptNoCache(url)
		langCache.set(url, scriptPromise)
	}
	return await scriptPromise
}

const PRISM_ALIASES: Record<string, string> = {
	zsh: 'bash',
}

async function loadLang(alias: string): Promise<HTMLScriptElement> {
	//TODO: undo when doing pygments or prism 2
	const lang = PRISM_ALIASES[alias] ?? alias
	return await loadScript(urls.prism(`components/prism-${lang}.min.js`))
}

const style2Sx = <P extends object>({
	style,
	...props
}: P & { style?: React.CSSProperties }) => ({
	...props,
	...(props ? { sx: style as SystemStyleObject } : {}),
})

export interface HighProps<Theme extends object = object> {
	code: string
	language: string
	sx?: SxProps<Theme>
}

const High: FC<HighProps> = ({ code, language, sx }) => {
	const [loaded, setLoaded] = useState(false)
	const [err, setErr] = useState<Error>()
	const theme = useTheme()
	const prismTheme =
		theme.palette.mode === 'dark' ? themes.vsDark : themes.vsLight
	useEffect(() => {
		loadLang(language)
			.then(() => setLoaded(true))
			.catch((e) => setErr(e as Error))
	}, [language])
	if (err) throw err
	return (
		<Highlight
			prism={Prism}
			code={code}
			language={loaded ? language : 'text'}
			theme={prismTheme}
		>
			{({ className, style, tokens, getLineProps, getTokenProps }) => (
				<CodeBlock
					className={className}
					sx={mergeSx(style as SystemStyleObject, sx, { padding: '5px' })}
				>
					{tokens.map((line, i) => (
						// biome-ignore lint/correctness/useJsxKeyInIterable: Static tree, no need for key
						<Box component="span" {...style2Sx(getLineProps({ line, key: i }))}>
							{line.map((token, key) => (
								// biome-ignore lint/correctness/useJsxKeyInIterable: Static tree, no need for key
								<Box
									component="span"
									{...style2Sx(getTokenProps({ token, key }))}
								/>
							))}
							{'\n'}
						</Box>
					))}
				</CodeBlock>
			)}
		</Highlight>
	)
}

export default High
