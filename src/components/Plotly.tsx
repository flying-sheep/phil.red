import useTheme from '@mui/material/styles/useTheme'
import { Theme } from '@mui/material/styles/createTheme'
import { Data, Layout, Margin } from 'plotly.js'
import {
	FC, useCallback, useEffect, useState,
} from 'react'
import Plot, { PlotParams } from 'react-plotly.js'

export interface PlotlyProps extends Partial<PlotParams> {
	url: string
	onClickLink?: string
}

const defaultOverride = (theme: Theme): Partial<PlotParams> => ({
	layout: {
		paper_bgcolor: 'transparent',
		plot_bgcolor: 'transparent',
		font: { color: theme.palette.text.primary },
		xaxis: { automargin: true },
		yaxis: { automargin: true },
		margin: {
			l: 70,
			r: 0,
			b: 70,
			t: 30, // title
			pad: 0,
		} as Margin & { pad: number },
	},
})

const Plotly: FC<PlotlyProps> = ({
	url, onClickLink, onClick, ...rest
}) => {
	const theme = useTheme()
	const [layout, setLayout] = useState<Layout>()
	const [data, setData] = useState<Data[]>()
	
	useEffect(() => {
		fetch(url).then((r) => {
			if (r.ok) return r.json()
			throw new Error(r.statusText)
		}).then(({ layout, data }) => {
			setLayout(layout)
			setData(data)
		}).catch((e) => console.error(e)) // eslint-disable-line no-console
	}, [url])
	
	const handleOnClickLink = useCallback((e: Readonly<Plotly.PlotMouseEvent>) => {
		const point = e.points[0] as { [key: string]: any }
		const url = (onClickLink ?? '{}').replace(/\{(\w+)\}/, (_, key) => (key in point ? point[key] : `{${key}}`))
		window.open(url)
	}, [onClickLink])

	if (!data) return null
	// TODO: deep merge everything
	const props: PlotParams = {
		layout: { ...defaultOverride(theme).layout, ...layout, ...rest.layout },
		data: [...(data || []), ...(rest.data || [])],
		onClick: onClickLink ? handleOnClickLink : onClick,
		...rest,
	}
	return <Plot useResizeHandler {...props}/>
}

export default Plotly
