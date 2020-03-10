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
	sub?: React.ReactNode,
	icon?: React.ReactNode | React.ElementType,
	children?: React.ReactNode,
}

const ListItemLink = ({
	href, sub, icon, children,
}: ListItemLinkProps = {}) => (
	<ListItem button component={Link} href={href}>
		<ListItemAvatar>
			<Avatar>
				{React.isValidElement(icon) ? icon : icon && React.createElement(icon as React.ElementType)}
			</Avatar>
		</ListItemAvatar>
		<ListItemText primary={children} secondary={sub}/>
	</ListItem>
)

const GitHubList = () => (
	<List>
		<ListItem><ListItemText primary="2nd author"/></ListItem>
		<ListItemLink href="https://github.com/theislab/scanpy" icon={i.AllInclusive} sub="single cell analysis in Python">scanpy</ListItemLink>
		<ListItem><ListItemText primary="1st, main, or only author"/></ListItem>
		<ListItemLink href="https://github.com/theislab/anndata" icon={i.ViewComfy} sub="annotated single cell expression matrix for Python">AnnData</ListItemLink>
		<ListItemLink href="https://github.com/theislab/anndata2ri" icon={i.SwapCalls} sub="convert between AnnData (Python) and SingleCellExperiment (R)">anndata2ri</ListItemLink>
		<ListItemLink href="https://github.com/theislab/destiny" icon={i.BlurOn} sub="diffusion maps, pseudotime, and gene relevance in R">destiny</ListItemLink>
		<ListItemLink href="https://github.com/IRkernel/IRkernel" icon={i.BubbleChart} sub="R kernel for JupyterLab/Notebooks">IRkernel</ListItemLink>
		<ListItemLink href="https://github.com/IRkernel/repr" icon={i.EmojiSymbols} sub="rich representations for R objects">repr</ListItemLink>
		<ListItemLink href="https://github.com/flying-sheep/rust-rst" icon={i.Settings} sub="reStructuredText parser and renderer in Rust">rust-rst</ListItemLink>
		<ListItemLink href="https://github.com/flying-sheep/phil.red" icon={i.Web} sub="this website">phil.red</ListItemLink>
	</List>
)

export default function Blog({ match }: RouteComponentProps) {
	return (
		<>
			<ListItemLink href="https://github.com/flying-sheep" icon={i.GitHub} sub="flying-sheep">GitHub</ListItemLink>
			<ListItemLink href="https://pypi.org/user/flyingsheep/" icon={PythonIcon} sub="My Python packages (me=author)">PyPI</ListItemLink>
			<ListItemLink href="https://aur.archlinux.org/packages/?K=flying-sheep&amp;SeB=m" icon={ArchIcon} sub="My Arch Linux packages (me=packager)">AUR</ListItemLink>
			<GitHubList/>
		</>
	)
}
