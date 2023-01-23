import useTheme from '@mui/material/styles/useTheme'
import {
	Children, FC, useCallback, useMemo,
} from 'react'
import { JSONTree, ShouldExpandNodeInitially } from 'react-json-tree'
import { PortalSource } from 'react-portal-target'

import { Document } from '../../markup/MarkupDocument'

import MarkupNodeComponent from './MarkupNodeComponent'

export interface MarkupProps {
	doc: Document
}

const Markup: FC<MarkupProps> = ({ doc: { children } }) => {
	const theme = useTheme()
	const expand = useCallback<ShouldExpandNodeInitially>((keyPath) => keyPath[0] !== 'pos', [])
	const nodes = useMemo(
		() => children.map((e) => <MarkupNodeComponent node={e} level={0}/>),
		[children],
	)
	return (
		<article>
			{Children.toArray(nodes)}
			{process.env.NODE_ENV === 'development' && (
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
		</article>
	)
}

export default Markup
