import * as React from 'react'
import useScrollTrigger from '@material-ui/core/useScrollTrigger'

interface Props {
	children: React.ReactElement;
}

export default function ElevationScroll({ children }: Props) {
	const trigger = useScrollTrigger({
		disableHysteresis: true,
		threshold: 0,
	})

	return React.cloneElement(children, {
		elevation: trigger ? 4 : 0,
	})
}
