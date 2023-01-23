import useFetch from 'fetch-suspense'
import type { Data, Layout, Margin } from 'plotly.js-basic-dist-min'
import {
	FC, lazy, Suspense, useCallback,
} from 'react'
import type { PlotParams } from 'react-plotly.js'
import createPlotlyComponent from 'react-plotly.js/factory'

import { Theme } from '@mui/material/styles/createTheme'
import useTheme from '@mui/material/styles/useTheme'

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

interface ResponseData { layout: Layout, data: Data[] }

const Plot = lazy(async () => {
	const { default: Plotly } = await import('plotly.js-basic-dist-min')
	return { default: createPlotlyComponent(Plotly) }
})

const PlotlyInner: FC<Omit<PlotlyProps, 'onClickLink'>> = ({ url, onClick, ...rest }) => {
	const theme = useTheme()
	const resp = useFetch(url) as ResponseData

	// TODO: deep merge everything
	const props: PlotParams = {
		layout: { ...defaultOverride(theme).layout, ...resp.layout, ...rest.layout },
		data: [...(resp.data || []), ...(rest.data || [])],
		onClick,
		...rest,
	}
	return <Plot useResizeHandler {...props}/>
}

const Plotly: FC<PlotlyProps> = ({
	onClickLink, onClick, ...rest
}) => {
	const handleOnClickLink = useCallback((e: Readonly<Plotly.PlotMouseEvent>) => {
		const point = e.points[0] as { [key: string]: any }
		const url = (onClickLink ?? '{}').replace(/\{(\w+)\}/, (_, key) => (key in point ? point[key] : `{${key}}`))
		window.open(url)
	}, [onClickLink])

	return (
		<Suspense fallback="Loading…">
			<PlotlyInner onClick={onClickLink ? handleOnClickLink : onClick} {...rest}/>
		</Suspense>
	)
}

export default Plotly
