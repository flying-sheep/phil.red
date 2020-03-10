import React from 'react'
import { RouteComponentProps } from 'react-router'

import {
	Link, List, ListItem, ListItemAvatar, Avatar, ListItemText,
} from '@material-ui/core'
import i from '@material-ui/icons'

import PythonIcon from './python-icon'
import ArchIcon from './arch-icon'


type ListItemLinkProps = {
	href?: string,
	icon?: React.ReactNode | React.ElementType,
	text?: React.ReactNode,
	sub?: React.ReactNode,
}

const ListItemLink = ({
	href, icon, text, sub,
}: ListItemLinkProps = {}) => (
	<ListItem button component={Link} href={href}>
		<ListItemAvatar>
			<Avatar>
				{React.isValidElement(icon) ? icon : icon && React.createElement(icon as React.ElementType)}
			</Avatar>
		</ListItemAvatar>
		<ListItemText primary={text} secondary={sub}/>
	</ListItem>
)

const GitHubItems = () => (
	<>
		<ListItem><ListItemText primary="2nd author"/></ListItem>
		<ListItemLink
			href="https://github.com/theislab/scanpy"
			icon={i.AllInclusive}
			text="scanpy"
			sub="single cell analysis in Python"
		/>
		<ListItem><ListItemText primary="1st, main, or only author"/></ListItem>
		<ListItemLink
			href="https://github.com/theislab/anndata"
			icon={i.ViewComfy}
			text="AnnData"
			sub="annotated single cell expression matrix for Python"
		/>
		<ListItemLink
			href="https://github.com/theislab/anndata2ri"
			icon={i.SwapCalls}
			text="anndata2ri"
			sub="convert between AnnData (Python) and SingleCellExperiment (R)"
		/>
		<ListItemLink
			href="https://github.com/theislab/destiny"
			icon={i.BlurOn}
			text="destiny"
			sub="diffusion maps, pseudotime, and gene relevance in R"
		/>
		<ListItemLink
			href="https://github.com/IRkernel/IRkernel"
			icon={i.BubbleChart}
			text="IRkernel"
			sub="R kernel for JupyterLab/Notebooks"
		/>
		<ListItemLink
			href="https://github.com/IRkernel/repr"
			icon={i.EmojiSymbols}
			text="repr"
			sub="rich representations for R objects"
		/>
		<ListItemLink
			href="https://github.com/flying-sheep/rust-rst"
			icon={i.Settings}
			text="rust-rst"
			sub="reStructuredText parser and renderer in Rust"
		/>
		<ListItemLink
			href="https://github.com/flying-sheep/phil.red"
			icon={i.Web}
			text="phil.red"
			sub="this website"
		/>
	</>
)

export default function Blog({ match }: RouteComponentProps) {
	return (
		<List>
			<ListItemLink
				href="https://github.com/flying-sheep"
				icon={i.GitHub}
				text="GitHub"
				sub="flying-sheep"
			/>
			<ListItemLink
				href="https://pypi.org/user/flyingsheep/"
				icon={PythonIcon}
				text="PyPI"
				sub="My Python packages (me=author)"
			/>
			<ListItemLink
				href="https://aur.archlinux.org/packages/?K=flying-sheep&amp;SeB=m"
				icon={ArchIcon}
				text="AUR"
				sub="My Arch Linux packages (me=packager)"
			/>
			<GitHubItems/>
		</List>
	)
}
