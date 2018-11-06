import * as React from 'react'
import Plot, { PlotParams } from 'react-plotly.js'

export interface PlotlyProps extends Partial<PlotParams> {
	url: string
}
export interface PlotlyState {
	data?: PlotParams
}
export default class ExampleWithoutAsync extends React.Component<PlotlyProps, PlotlyState> {
	constructor(props: PlotlyProps) {
		super(props)
		this.state = {}
		fetch(props.url).then((r) => {
			if (r.ok) return r.json()
			throw new Error(r.statusText)
		}).then(data => this.setState({ data }))
	}
	
	render(): React.ReactNode {
		const { data } = this.state
		if (!data) return null
		const { url, children, ...rest } = this.props
		const props: PlotParams = { ...data, ...rest }
		return <Plot {...props}>{children}</Plot>
	}
}
