import { createElement, isValidElement } from 'react'
import { Helmet } from 'react-helmet'

import Link from '@mui/material/Link'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import ListItemText from '@mui/material/ListItemText'
import List from '@mui/material/List'

import GitHub from '@mui/icons-material/GitHub'
import AllInclusive from '@mui/icons-material/AllInclusive'
import ViewComfy from '@mui/icons-material/ViewComfy'
import SwapCalls from '@mui/icons-material/SwapCalls'
import BlurOn from '@mui/icons-material/BlurOn'
import BubbleChart from '@mui/icons-material/BubbleChart'
import EmojiSymbols from '@mui/icons-material/EmojiSymbols'
import Settings from '@mui/icons-material/Settings'
import Web from '@mui/icons-material/Web'

import PythonIcon from './python-icon'
import ArchIcon from './arch-icon'

type ListItemLinkProps = {
	href?: string
	icon?: React.ReactNode | React.ElementType
	text?: React.ReactNode
	sub?: React.ReactNode
}

const ListItemLink = ({
	href, icon, text, sub,
}: ListItemLinkProps = {}) => (
	<ListItem disablePadding>
		<ListItemButton component={Link} href={href}>
			<ListItemAvatar>
				<Avatar>
					{isValidElement(icon)
						? icon
						: icon && createElement(icon as React.ElementType)}
				</Avatar>
			</ListItemAvatar>
			<ListItemText primary={text} secondary={sub}/>
		</ListItemButton>
	</ListItem>
)

const GitHubItems = () => (
	<>
		<ListItem><ListItemText primary="2nd author"/></ListItem>
		<ListItemLink
			href="https://github.com/theislab/scanpy"
			icon={AllInclusive}
			text="scanpy"
			sub="single cell analysis in Python"
		/>
		<ListItem><ListItemText primary="1st, main, or only author"/></ListItem>
		<ListItemLink
			href="https://github.com/theislab/anndata"
			icon={ViewComfy}
			text="AnnData"
			sub="annotated single cell expression matrix for Python"
		/>
		<ListItemLink
			href="https://github.com/theislab/anndata2ri"
			icon={SwapCalls}
			text="anndata2ri"
			sub="convert between AnnData (Python) and SingleCellExperiment (R)"
		/>
		<ListItemLink
			href="https://github.com/theislab/destiny"
			icon={BlurOn}
			text="destiny"
			sub="diffusion maps, pseudotime, and gene relevance in R"
		/>
		<ListItemLink
			href="https://github.com/IRkernel/IRkernel"
			icon={BubbleChart}
			text="IRkernel"
			sub="R kernel for JupyterLab/Notebooks"
		/>
		<ListItemLink
			href="https://github.com/IRkernel/repr"
			icon={EmojiSymbols}
			text="repr"
			sub="rich representations for R objects"
		/>
		<ListItemLink
			href="https://github.com/flying-sheep/rust-rst"
			icon={Settings}
			text="rust-rst"
			sub="reStructuredText parser and renderer in Rust"
		/>
		<ListItemLink
			href="https://github.com/flying-sheep/phil.red"
			icon={Web}
			text="phil.red"
			sub="this website"
		/>
	</>
)

export default function Code() {
	return (
		<>
			<Helmet>
				<title>Code – phil.red</title>
			</Helmet>
			<List>
				<ListItemLink
					href="https://github.com/flying-sheep"
					icon={GitHub}
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
		</>
	)
}
