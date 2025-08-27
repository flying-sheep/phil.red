import { CircularProgress, Stack } from '@mui/material'
import { lazy, Suspense } from 'react'
import type { VegaProps } from './VegaInner'

export type { VegaProps }

const VegaInner = lazy(() => import('./VegaInner'))

const Vega = (props: VegaProps) => (
	<Suspense
		fallback={
			<Stack alignItems="center">
				<CircularProgress />
			</Stack>
		}
	>
		<VegaInner {...props} />
	</Suspense>
)

export default Vega
