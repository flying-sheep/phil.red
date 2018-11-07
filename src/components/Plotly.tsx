import * as React from 'react'
import Plot, { PlotParams, Figure } from 'react-plotly.js'

export interface PlotlyProps extends Partial<PlotParams> {
	url: string
}

const DEFAULT_OVERRIDE: Partial<PlotParams> = {
	layout: {
		paper_bgcolor: 'transparent',
		plot_bgcolor: 'transparent',
	},
}

export default class Plotly extends React.Component<PlotlyProps, Partial<Figure>> {
	constructor(props: PlotlyProps) {
		super(props)
		this.state = {}
		fetch(props.url).then((r) => {
			if (r.ok) return r.json()
			throw new Error(r.statusText)
		}).then(({ layout, data }) => this.setState({ layout, data }))
	}
	
	render(): React.ReactNode {
		const { data, layout } = this.state
		if (!data) return null
		const { url, children, ...rest } = this.props
		const props: PlotParams = {
			layout: { ...DEFAULT_OVERRIDE.layout, ...layout, ...rest.layout },
			data: [...(data || []), ...(rest.data || [])],
		}
		return <Plot {...props}>{children}</Plot>
	}
}
