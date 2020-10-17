import * as React from 'react'
import { Margin } from 'plotly.js'
import Plot, { PlotParams, Figure } from 'react-plotly.js'

export interface PlotlyProps extends Partial<PlotParams> {
	url: string
	onClickLink?: string
}

const DEFAULT_OVERRIDE: Partial<PlotParams> = {
	layout: {
		paper_bgcolor: 'transparent',
		plot_bgcolor: 'transparent',
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
}

export default class Plotly extends React.Component<PlotlyProps, Partial<Figure>> {
	constructor(props: PlotlyProps) {
		super(props)
		this.state = {}
		fetch(props.url).then((r) => {
			if (r.ok) return r.json()
			throw new Error(r.statusText)
		}).then(({ layout, data }) => {
			this.setState({ layout, data })
		}).catch((e) => console.error(e))
		this.handleOnClickLink = this.handleOnClickLink.bind(this)
	}
	
	handleOnClickLink(e: Readonly<Plotly.PlotMouseEvent>) {
		const { onClickLink = '{}' } = this.props
		const point = e.points[0] as { [key: string]: any }
		const url = onClickLink.replace(/\{(\w+)\}/, (_, key) => (key in point ? point[key] : `{${key}}`))
		window.open(url)
	}
	
	render(): React.ReactNode {
		const { data, layout } = this.state
		if (!data) return null
		const {
			url, children, onClickLink, onClick: onClickExplicit,
			...rest
		} = this.props
		// TODO: deep merge everything
		const props: PlotParams = {
			layout: { ...DEFAULT_OVERRIDE.layout, ...layout, ...rest.layout },
			data: [...(data || []), ...(rest.data || [])],
			onClick: onClickLink ? this.handleOnClickLink : onClickExplicit,
			...rest,
		}
		// TODO: resize plot on window resize
		return <Plot {...props}>{children}</Plot>
	}
}
