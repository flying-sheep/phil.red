import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { lazy, Suspense } from 'react'
import type { VegaProps } from './VegaInner'

export type { VegaProps }

const VegaInner = lazy(() => import('./VegaInner'))

const Vega = (props: VegaProps) => (
	<Suspense
		fallback={
			<Stack sx={{ alignItems: 'center' }}>
				<CircularProgress />
			</Stack>
		}
	>
		<VegaInner {...props} />
	</Suspense>
)

export default Vega
