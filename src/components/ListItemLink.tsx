import * as React from 'react'
import { Link, LinkProps } from 'react-router-dom'

import ListItem, { ListItemProps } from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'

interface LilProps extends LinkProps {
	icon?: React.ReactElement<any>,
	primary?: React.ReactNode,
	secondary?: React.ReactNode,
}

export default class ListItemLink extends React.Component<LilProps> {
	constructor(props: LilProps) {
		super(props)
		this.renderLink = this.renderLink.bind(this)
	}
	
	renderLink({ children, className, role }: ListItemProps) {
		const {
			icon, primary, secondary, ...props
		} = this.props
		return <Link {...props} className={className} role={role}>{children}</Link>
	}

	render() {
		const { icon, primary, secondary } = this.props
		return (
			<li>
				<ListItem button component={this.renderLink}>
					{icon && <ListItemIcon>{icon}</ListItemIcon>}
					<ListItemText inset primary={primary} secondary={secondary}/>
				</ListItem>
			</li>
		)
	}
}
