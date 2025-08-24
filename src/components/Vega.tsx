import { useTheme } from '@mui/material/styles'
import { type FC, useRef } from 'react'
import type { Config } from 'vega-lite'
import * as themes from 'vega-themes'
import { useVegaEmbed, type VegaEmbedProps } from './VegaEmbed'

const VegaLite: FC<VegaEmbedProps> = ({
	spec,
	options,
	onEmbed,
	onError,
	...divProps
}) => {
	const theme = useTheme()
	const ref = useRef<HTMLDivElement>(null)

	const vltheme = (
		theme.palette.mode === 'dark' ? themes.dark : themes.carbonwhite
	) as Config

	spec = {
		...spec,
		autosize: { type: 'fit', contains: 'padding', resize: true },
		config: {
			...spec.config,
			...vltheme,
			background: 'transparent',
		},
	}
	useVegaEmbed({ ref, spec, options, onEmbed, onError })
	return <figure ref={ref} {...divProps} style={{ width: '100%', margin: 0 }} />
}

export default VegaLite
