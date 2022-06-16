import { cloneElement } from 'react'
import useScrollTrigger from '@mui/material/useScrollTrigger'

interface Props {
	children: React.ReactElement;
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
