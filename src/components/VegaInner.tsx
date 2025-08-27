import Box, { type BoxProps } from '@mui/material/Box'
import type { SxProps } from '@mui/system'
import { mergeSx } from 'merge-sx'
import { type FC, useMemo, useRef } from 'react'
import { type UseVegaEmbedParams, useVegaEmbed } from 'react-vega'
import type { VisualizationSpec } from 'vega-embed'
import { mergeConfig } from 'vega-util'
import { useMuiVegaOptions } from './mui-vega'

export interface VegaProps
	extends Omit<UseVegaEmbedParams, 'ref' | 'spec'>,
		Omit<BoxProps<'figure'>, 'onError'> {
	spec: VisualizationSpec
	sx?: SxProps
}

const VegaInner: FC<VegaProps> = ({
	spec: rawSpec,
	options,
	onEmbed,
	onError,
	sx: rawSx,
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
	useVegaEmbed(
		useMemo(() => {
			const props: UseVegaEmbedParams = { ref, spec }
			if (options) props.options = options
			if (onEmbed) props.onEmbed = onEmbed
			if (onError) props.onError = onError
			return props
		}, [spec, options, onEmbed, onError]),
	)
	const sx = useMemo(() => mergeSx({ margin: 0 }, rawSx), [rawSx])
	return <Box ref={ref} component="figure" {...boxProps} sx={sx} />
}

export default VegaInner
