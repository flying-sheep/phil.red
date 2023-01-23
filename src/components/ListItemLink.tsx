import { Link, LinkProps } from 'react-router-dom'

import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'

interface LilProps extends LinkProps {
	icon?: React.ReactElement<any>,
	primary?: React.ReactNode,
	secondary?: React.ReactNode,
}

const ListItemLink = ({
	icon, primary, secondary, ...props
}: LilProps) => (
	<ListItem disablePadding>
		<ListItemButton component={Link} {...props}>
			{icon && <ListItemIcon>{icon}</ListItemIcon>}
			<ListItemText inset primary={primary} secondary={secondary}/>
		</ListItemButton>
	</ListItem>
)

export default ListItemLink
