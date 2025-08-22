import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import useFetch from 'fetch-suspense'
import { type ComponentProps, type FC, lazy, Suspense } from 'react'
import type * as reactVega from 'react-vega'
import * as themes from 'vega-themes'

const Plot = lazy(async () => {
	const { VegaLite } = await import('react-vega')
	return { default: VegaLite }
})

export interface VegaLiteProps
	extends Omit<ComponentProps<typeof reactVega.VegaLite>, 'data'> {
	url: string
}

const VegaLiteInner: FC<VegaLiteProps> = ({ url, spec: rawSpec, ...props }) => {
	const theme = useTheme()
	const data = useFetch(url) as unknown[]

	const spec: reactVega.VisualizationSpec = {
		...rawSpec,
		config: {
			...(theme.palette.mode === 'dark' ? themes.dark : themes.carbonwhite),
			background: 'transparent',
		},
		autosize: { type: 'fit', contains: 'padding' },
		data: { name: 'table' },
	}
	return <Plot data={{ table: data }} spec={spec} {...props} />
}

const VegaLite: FC<VegaLiteProps> = (props) => (
	<Suspense
		fallback={
			<Stack alignItems="center">
				<CircularProgress />
			</Stack>
		}
	>
		<VegaLiteInner {...props} />
	</Suspense>
)

export default VegaLite
