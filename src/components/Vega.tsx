import Box, { type BoxProps } from '@mui/material/Box'
import type { SxProps } from '@mui/system'
import { mergeSx } from 'merge-sx'
import { type FC, useMemo, useRef } from 'react'
import type { VisualizationSpec } from 'vega-embed'
import { mergeConfig } from 'vega-util'
import { useMuiVegaOptions } from './mui-vega'
import { type UseVegaEmbedParams, useVegaEmbed } from './VegaEmbed'

export interface VegaProps
	extends Omit<UseVegaEmbedParams, 'ref'>,
		Omit<BoxProps<'figure'>, 'onError'> {
	sx?: SxProps
}

const Vega: FC<VegaProps> = ({
	spec: rawSpec,
	options,
	onEmbed,
	onError,
	sx,
	...boxProps
}) => {
	const ref = useRef<HTMLDivElement>(null)
	const vgtheme = useMuiVegaOptions()
	// TODO: fix types, merge deep
	const spec = useMemo<VisualizationSpec>(
		() =>
			({
				...rawSpec,
				...{
					autosize: { type: 'fit', contains: 'padding', resize: true },
					config: mergeConfig(rawSpec.config ?? {}, vgtheme, {
						background: 'transparent',
					}),
				},
			}) as VisualizationSpec,
		[rawSpec, vgtheme],
	)
	useVegaEmbed({ ref, spec, options, onEmbed, onError })
	return (
		<Box
			ref={ref}
			component="figure"
			{...boxProps}
			sx={mergeSx({ margin: 0 }, sx)}
		/>
	)
}

export default Vega
