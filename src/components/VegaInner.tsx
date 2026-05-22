import Box, { type BoxProps } from '@mui/material/Box'
import type { SxProps } from '@mui/material/styles'
import { mergeSx } from 'merge-sx'
import { type FC, useMemo, useRef } from 'react'
import { type UseVegaEmbedParams, useVegaEmbed } from 'react-vega'
import type { Config, Spec } from 'vega-typings'
import { mergeConfig as mc } from 'vega-util'
import { useMuiVegaOptions } from './mui-vega'

const mergeConfig = mc as unknown as (...configs: Partial<Config>[]) => Config

export interface VegaProps
	extends Omit<UseVegaEmbedParams, 'ref' | 'spec'>,
		Omit<BoxProps<'figure'>, 'onError'> {
	spec: Spec
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
	const spec = useMemo<Spec>(
		() => ({
			...rawSpec,
			...{
				autosize: { type: 'fit', contains: 'padding', resize: true },
				config: mergeConfig(rawSpec.config ?? {}, vgtheme, {
					background: 'transparent',
				}),
			},
		}),
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
