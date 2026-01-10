import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import type { SelectChangeEvent } from '@mui/material/Select'
import Select from '@mui/material/Select'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Children, type FC, useCallback, useMemo, useState } from 'react'
import { base16Themes } from 'react-base16-styling'
import { JSONTree, type ShouldExpandNodeInitially } from 'react-json-tree'
import { PortalSource } from 'react-portal-target'
import type { Document } from '../../markup/MarkupDocument'
import MarkupNodeComponent from './MarkupNodeComponent'

export interface MarkupProps {
	doc: Document
}

const Markup: FC<MarkupProps> = ({ doc }) => {
	const nodes = useMemo(
		() =>
			doc.children.map((e, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: Static tree, no need for key
				<MarkupNodeComponent node={e} level={0} key={i} />
			)),
		[doc.children],
	)
	return (
		<Box
			component="article"
			sx={{
				// Add space for the header when navigating to anchors
				':target::before': {
					content: '""',
					display: 'block',
					pointerEvents: 'none',
					height: '75px',
					marginTop: '-75px',
				},
			}}
		>
			{Children.toArray(nodes)}
			{import.meta.env.DEV && <Tree doc={doc} />}
		</Box>
	)
}

const Tree: FC<MarkupProps> = ({ doc: { children } }) => {
	const dark = useMediaQuery('(prefers-color-scheme: dark)')
	const [theme, setTheme] =
		useState<keyof typeof base16Themes>('atelierSeaside')
	const handleThemeChange = useCallback(
		(e: SelectChangeEvent<keyof typeof base16Themes>) => {
			setTheme(e.target.value)
		},
		[],
	)
	const expand = useCallback<ShouldExpandNodeInitially>(
		(keyPath) => keyPath[0] !== 'pos',
		[],
	)
	return (
		<PortalSource name="page-source">
			<Box sx={{ position: 'relative' }}>
				<JSONTree
					data={children}
					hideRoot
					shouldExpandNodeInitially={expand}
					theme={{ extend: theme }}
					invertTheme={!dark}
				/>
				<Select
					value={theme}
					onChange={handleThemeChange}
					sx={{ position: 'absolute', top: 0, right: 0, m: 3 }}
				>
					{Object.keys(base16Themes).map((t) => (
						<MenuItem key={t} value={t}>
							{t}
						</MenuItem>
					))}
				</Select>
			</Box>
		</PortalSource>
	)
}

export default Markup
