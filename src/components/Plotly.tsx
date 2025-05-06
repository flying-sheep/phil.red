import useFetch from 'fetch-suspense'
import type { Data, Layout } from 'plotly.js-basic-dist-min'
import { type FC, Suspense, lazy, useCallback } from 'react'
import type { PlotParams } from 'react-plotly.js'
import createPlotlyComponent from 'react-plotly.js/factory'

import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { type Theme, useTheme } from '@mui/material/styles'

export interface PlotlyProps extends Partial<PlotParams> {
	url: string
	onClickLink?: string | undefined
}

const defaultOverride = (theme: Theme): Partial<PlotParams> => ({
	layout: {
		paper_bgcolor: 'transparent',
		plot_bgcolor: 'transparent',
		font: { color: theme.vars.palette.text.primary },
		xaxis: { automargin: true },
		yaxis: { automargin: true },
		margin: {
			l: 70,
			r: 0,
			b: 70,
			t: 30, // title
			pad: 0,
		},
	},
})

interface ResponseData {
	layout: Layout
	data: Data[]
}

const Plot = lazy(async () => {
	const { default: Plotly } = await import('plotly.js-basic-dist-min')
	return { default: createPlotlyComponent(Plotly) }
})

const PlotlyInner: FC<Omit<PlotlyProps, 'onClickLink'>> = ({
	url,
	onClick,
	...rest
}) => {
	const theme = useTheme()
	const resp = useFetch(url) as ResponseData

	// TODO: deep merge everything
	const props: PlotParams = {
		layout: {
			...defaultOverride(theme).layout,
			...resp.layout,
			...rest.layout,
		},
		data: [...(resp.data ?? []), ...(rest.data ?? [])],
		onClick,
		...rest,
	}
	return <Plot useResizeHandler {...props} />
}

const Plotly: FC<PlotlyProps> = ({ onClickLink, onClick, ...rest }) => {
	const handleOnClickLink = useCallback(
		(e: Readonly<Plotly.PlotMouseEvent>) => {
			const point = e.points[0] as unknown as Record<string, string>
			const url = (onClickLink ?? '{}').replace(
				/\{(\w+)\}/,
				(_, key) => point[key] ?? `{${key as string}}`,
			)
			window.open(url)
		},
		[onClickLink],
	)

	return (
		<Suspense
			fallback={
				<Stack alignItems="center">
					<CircularProgress />
				</Stack>
			}
		>
			<PlotlyInner
				onClick={onClickLink ? handleOnClickLink : onClick}
				{...rest}
			/>
		</Suspense>
	)
}

export default Plotly
