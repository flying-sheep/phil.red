import { Children, type FC, useCallback, useMemo } from 'react'
import { JSONTree, type ShouldExpandNodeInitially } from 'react-json-tree'
import { PortalSource } from 'react-portal-target'

import Box from '@mui/material/Box'
import useTheme from '@mui/material/styles/useTheme'

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
		// biome-ignore lint/correctness/useJsxKeyInIterable: Static tree, no need for key
		() => children.map((e) => <MarkupNodeComponent node={e} level={0} />),
		[children],
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
