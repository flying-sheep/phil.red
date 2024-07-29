import { createElement } from 'react'
import { Helmet } from 'react-helmet-async'
import { isValidElementType } from 'react-is'

import Avatar from '@mui/material/Avatar'
import Link from '@mui/material/Link'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'

import AllInclusive from '@mui/icons-material/AllInclusive'
import BlurOn from '@mui/icons-material/BlurOn'
import BubbleChart from '@mui/icons-material/BubbleChart'
import EmojiSymbols from '@mui/icons-material/EmojiSymbols'
import GitHub from '@mui/icons-material/GitHub'
import Settings from '@mui/icons-material/Settings'
import SwapCalls from '@mui/icons-material/SwapCalls'
import ViewComfy from '@mui/icons-material/ViewComfy'
import Web from '@mui/icons-material/Web'

import ArchIcon from './arch-icon'
import PythonIcon from './python-icon'

type ListItemLinkProps<P = object> = {
	href?: string
	icon?: React.ReactNode | React.ComponentType<P>
	text?: React.ReactNode
	sub?: React.ReactNode
}

function isValidComponentType<P = object>(
	e: React.ReactNode | React.ComponentType<P>,
): e is React.ComponentType<P> {
	return typeof e !== 'string' && isValidElementType(e)
}

const ListItemLink = ({ href, icon, text, sub }: ListItemLinkProps = {}) => (
	<ListItem disablePadding>
		<ListItemButton component={Link} href={href}>
			<ListItemAvatar>
				<Avatar>
					{isValidComponentType(icon) ? createElement(icon) : icon}
				</Avatar>
			</ListItemAvatar>
			<ListItemText primary={text} secondary={sub} />
		</ListItemButton>
	</ListItem>
)

const GitHubItems = () => (
	<>
		<ListItem>
			<ListItemText primary="2nd author" />
		</ListItem>
		<ListItemLink
			href="https://github.com/theislab/scanpy"
			icon={AllInclusive}
			text="scanpy"
			sub="single cell analysis in Python"
		/>
		<ListItem>
			<ListItemText primary="1st, main, or only author" />
		</ListItem>
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

const Code = () => (
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
			<GitHubItems />
		</List>
	</>
)

export default Code
