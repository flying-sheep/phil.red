import Highlight, { Language } from 'prism-react-renderer'
import type { Prism as PrismRR } from 'prism-react-renderer'
import darkTheme from 'prism-react-renderer/themes/vsDark'
import lightTheme from 'prism-react-renderer/themes/vsLight'
import Prism from 'prismjs'
import { FC, useEffect, useState } from 'react'

import useTheme from '@mui/material/styles/useTheme'

import * as urls from '../../../build-tools/urls.js'

type PrismLib = typeof PrismRR & typeof Prism

const loadScriptNoCache = (url: string) => new Promise<HTMLScriptElement>((resolve, reject) => {
	const script = document.createElement('script')
	script.src = url
	document.body.appendChild(script)
	script.onload = () => resolve(script)
	script.onerror = (e) => {
		document.body.removeChild(script)
		reject(e)
	}
})

const langCache = new Map<string, Promise<HTMLScriptElement>>()

const loadScript = async (url: string) => {
	let scriptPromise = langCache.get(url)
	if (!scriptPromise) {
		scriptPromise = loadScriptNoCache(url)
		langCache.set(url, scriptPromise)
	}
	return scriptPromise
}

const loadLang = (lang: string) => loadScript(urls.prism(`components/prism-${lang}.min.js`))

export interface HighProps { code: string, language: Language, style?: React.CSSProperties }

const High: FC<HighProps> = ({ code, language, style }) => {
	const [loaded, setLoaded] = useState(false)
	const [err, setErr] = useState<Error>()
	const { palette: { mode } } = useTheme()
	const theme = mode === 'dark' ? darkTheme : lightTheme
	useEffect(() => {
		loadLang(language).then(() => setLoaded(true)).catch((e) => setErr(e as Error))
	}, [language, loaded])
	if (err) throw err
	return (
		<Highlight Prism={Prism as PrismLib} code={code} language={loaded ? language : ('text' as Language)} theme={theme}>
			{({
				className, style: defaultStyle, tokens, getLineProps, getTokenProps,
			}) => (
				<pre className={className} style={{ ...defaultStyle, ...style, padding: '5px' }}>
					{tokens.map((line, i) => (
						<div {...getLineProps({ line, key: i })}>
							{line.map((token, key) => (
								<span {...getTokenProps({ token, key })}/>
							))}
						</div>
					))}
				</pre>
			)}
		</Highlight>
	)
}

export default High
