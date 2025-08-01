import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import type { CSSProperties } from 'react'
import { Link, type LinkProps } from 'react-router'

interface LilProps extends LinkProps {
	icon?: React.ReactElement<unknown> | undefined
	primary?: React.ReactNode
	secondary?: React.ReactNode
	// TODO: these should be fixed in mui
	tabIndex?: number
	className?: string
	style?: CSSProperties
	autoFocus?: boolean
}

const ListItemLink = ({ icon, primary, secondary, ...props }: LilProps) => (
	<ListItem disablePadding>
		<ListItemButton component={Link} {...props}>
			{icon && <ListItemIcon>{icon}</ListItemIcon>}
			<ListItemText primary={primary} secondary={secondary} />
		</ListItemButton>
	</ListItem>
)

export default ListItemLink
