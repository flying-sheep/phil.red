//import { useParentSize } from '@cutting/use-get-parent-size'
import { useTheme } from '@mui/material/styles'
import { type FC, useRef } from 'react'
import type { Config } from 'vega-lite'
import * as themes from 'vega-themes'
import { useVegaEmbed, type VegaEmbedProps } from './VegaEmbed'

const VegaLite: FC<VegaEmbedProps> = ({
	spec,
	options = {},
	onEmbed,
	onError,
	...divProps
}) => {
	const theme = useTheme()
	const ref = useRef<HTMLDivElement>(null)
	//const { width } = useParentSize(ref)

	const vltheme = (
		theme.palette.mode === 'dark' ? themes.dark : themes.carbonwhite
	) as Config

	if (typeof spec === 'string') {
		throw new Error('VegaLite: spec must be an object')
	}
	//options.width = width - 100
	spec.config = {
		...spec.config,
		...vltheme,
		background: 'transparent',
	} as Config
	useVegaEmbed({ ref, spec, options, onEmbed, onError })
	return <div ref={ref} {...divProps} />
}

export default VegaLite
