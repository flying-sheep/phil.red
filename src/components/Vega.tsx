import { type FC, useMemo, useRef } from 'react'
import type { VisualizationSpec } from 'vega-embed'
import { mergeConfig } from 'vega-util'
import { useMuiVegaOptions } from './mui-vega'
import { useVegaEmbed, type VegaEmbedProps } from './VegaEmbed'

const VegaLite: FC<Omit<VegaEmbedProps, 'ref'>> = ({
	spec: rawSpec,
	options,
	onEmbed,
	onError,
	...divProps
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
	return <figure ref={ref} {...divProps} style={{ width: '100%', margin: 0 }} />
}

export default VegaLite
