declare module 'react-slide-routes' {
	import type { FC, ReactNode } from 'react'
	import type { Location } from 'react-router'

	export interface SlideRoutesProps {
		animation?: 'slide' | 'vertical-slide' | 'rotate'
		pathList?: Location['pathname'][]
		duration?: number
		timing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear'
		destroy?: boolean
		children: ReactNode | ReactNode[]
	}

	interface SlideRoutesDefaultProps {
		animation: 'slide'
		pathList: []
		duration: 200
		timing: 'ease'
		destroy: true
	}

	const SlideRoutes: FC<SlideRoutesProps> & {
		defaultProps: SlideRoutesDefaultProps
	}

	export default SlideRoutes
}
