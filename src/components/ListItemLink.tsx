import * as React from 'react'
import { Link, LinkProps } from 'react-router-dom'

import ListItem, { ListItemProps } from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'


interface LilProps extends LinkProps {
	icon?: React.ReactElement<any>,
	primary?: React.ReactNode,
}

export default class ListItemLink extends React.Component<LilProps> {
	constructor(props: LilProps) {
		super(props)
		this.renderLink = this.renderLink.bind(this)
	}
	
	renderLink({ children, className, role }: ListItemProps) {
		const { icon, primary, ...props } = this.props
		return <Link {...props} className={className} role={role}>{children}</Link>
	}

	render() {
		const { icon, primary } = this.props
		return (
			<li>
				<ListItem button component={this.renderLink}>
					{icon && <ListItemIcon>{icon}</ListItemIcon>}
					<ListItemText inset primary={primary}/>
				</ListItem>
			</li>
		)
	}
}
