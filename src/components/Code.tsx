import Typography from '@mui/material/Typography'
import type { ComponentProps } from 'react'

export interface CodeProps
	extends Omit<ComponentProps<typeof Typography>, 'component'> {
	ref?: React.Ref<HTMLElement>
}

const Code = (props: CodeProps) => <Typography component="code" {...props} />

export default Code
