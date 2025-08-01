import type { PaperProps } from '@mui/material'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import { cloneElement } from 'react'

interface Props {
	children: React.ReactElement<PaperProps>
}

export default function ElevationScroll({ children }: Props) {
	const trigger = useScrollTrigger({
		disableHysteresis: true,
		threshold: 0,
	})

	return cloneElement(children, {
		elevation: trigger ? 4 : 0,
	})
}
