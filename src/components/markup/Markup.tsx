import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { Children, type FC, useCallback, useMemo } from 'react'
import { JSONTree, type ShouldExpandNodeInitially } from 'react-json-tree'
import { PortalSource } from 'react-portal-target'

import type { Document } from '../../markup/MarkupDocument'

import MarkupNodeComponent from './MarkupNodeComponent'

export interface MarkupProps {
	doc: Document
}

const Markup: FC<MarkupProps> = ({ doc: { children } }) => {
	const theme = useTheme()
	const expand = useCallback<ShouldExpandNodeInitially>(
		(keyPath) => keyPath[0] !== 'pos',
		[],
	)
	const nodes = useMemo(
		() =>
			children.map((e, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: Static tree, no need for key
				<MarkupNodeComponent node={e} level={0} key={i} />
			)),
		[children],
	)
	return (
		<Box component="article">
			{Children.toArray(nodes)}
			{import.meta.env.DEV && (
				<PortalSource name="page-source">
					<JSONTree
						data={children}
						hideRoot
						shouldExpandNodeInitially={expand}
						theme={{ extend: 'solarized' }}
						invertTheme={theme.palette.mode === 'light'}
					/>
				</PortalSource>
			)}
		</Box>
	)
}

export default Markup
