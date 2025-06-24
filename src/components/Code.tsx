import Typography from '@mui/material/Typography'
import { type ComponentProps, forwardRef } from 'react'

export type CodeProps = Omit<ComponentProps<typeof Typography>, 'component'>

const Code = forwardRef<HTMLElement, CodeProps>((props, ref) => (
	<Typography component="code" ref={ref} {...props} />
))

export default Code
