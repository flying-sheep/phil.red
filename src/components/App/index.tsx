import { useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { PortalTarget } from 'react-portal-target'
import {
	Link,
	Route,
	Navigate,
	useLocation,
	matchPath,
} from 'react-router-dom'
import SlideRoutes from 'react-slide-routes'

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Toolbar from '@mui/material/Toolbar'
import { deepPurple } from '@mui/material/colors'
import { alpha, createTheme, ThemeProvider } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import Blog from '../Blog'
import Code from '../Code'
import Home from '../Home'

import ElevationScroll from './ElevationScroll'

const ROUTE_LINKS = [
	{ label: 'Blog', href: '/blog', pattern: '/blog/*' },
	{ label: 'Home', href: '/', pattern: '/' },
	{ label: 'Code', href: '/code', pattern: '/code' },
]

function useRouteMatch(patterns: readonly string[]) {
	const { pathname } = useLocation()

	for (const pattern of patterns) {
		const possibleMatch = matchPath(pattern, pathname)
		if (possibleMatch !== null) {
			return possibleMatch
		}
	}

	return null
}

const App = () => {
	const dark = useMediaQuery('(prefers-color-scheme: dark)')
	const theme = useMemo(
		() => createTheme({
			palette: {
				mode: dark ? 'dark' : 'light',
				primary: deepPurple,
			},
		}),
		[dark],
	)
	const currentTab = useRouteMatch(ROUTE_LINKS.map(({ pattern }) => pattern))?.pattern.path

	return (
		<ThemeProvider theme={theme}>
			<Helmet>
				<title>phil.red</title>
			</Helmet>
			<CssBaseline/>
			<ElevationScroll>
				<AppBar
					position="sticky"
					sx={{
						color: theme.palette.text.primary,
						background: alpha(theme.palette.background.default, 0.7),
						backdropFilter: 'contrast(200%) blur(15px)',
					}}
				>
					<Toolbar component="nav" sx={{ justifyContent: 'center' }}>
						<Tabs centered value={currentTab}>
							{ROUTE_LINKS.map(({ label, href, pattern }) => (
								<Tab
									key={label}
									label={label}
									value={pattern}
									component={Link}
									to={href}
								/>
							))}
						</Tabs>
					</Toolbar>
				</AppBar>
			</ElevationScroll>
			<Box
				component="main"
				sx={{
					maxWidth: '42rem',
					margin: '0 auto',
					py: 0,
					px: 3,
				}}
			>
				<SlideRoutes>
					<Route path="blog/*" element={<Blog/>}/>
					<Route index element={<Home/>}/>
					<Route path="code" element={<Code/>}/>
					<Route path="*" element={<Navigate replace to="/"/>}/>
				</SlideRoutes>
			</Box>
			<PortalTarget name="page-source"/>
		</ThemeProvider>
	)
}

export default App
