import { ComponentProps, forwardRef } from 'react'

import Typography from '@mui/material/Typography'

export type CodeProps = Omit<ComponentProps<typeof Typography>, 'component'>

const Code = forwardRef<HTMLElement, CodeProps>((props, ref) => (
	<Typography component="code" ref={ref} {...props} />
))

export default Code
