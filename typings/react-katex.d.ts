declare module 'react-katex' {
	import { Color } from 'csstype'
	
	export interface MathProps {
		children?: string
		math?: string
		errorColor?: Color
		renderError?: (error: Error) => React.ReactNode
	}
	export function InlineMath(props: MathProps): React.ReactElement<MathProps>
	export function DisplayMath(props: MathProps): React.ReactElement<MathProps>
}
