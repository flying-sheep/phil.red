import React from 'react'
import { RouteComponentProps } from 'react-router'

import { Card, Link } from '@material-ui/core'
import GitHubIcon from '@material-ui/icons/GitHub'

export default function Blog({ match }: RouteComponentProps) {
	return (
		<>
			<Card>
				<Link href="https://github.com/flying-sheep">
					<GitHubIcon/>
				</Link>
			</Card>
		</>
	)
}
