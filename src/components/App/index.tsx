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
import {
	alpha, createTheme, responsiveFontSizes, ThemeProvider,
} from '@mui/material/styles'
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

const linearScale = (d0: number, d1: number, r0: number, r1: number) => {
	const m = (r1 - r0) / (d1 - d0)
	const b = r0 - m * d0
	return (x: number) => m * x + b
}

const hScale = linearScale(1, 6, 3, 1)
const hSizes = Object.fromEntries([1, 2, 3, 4, 5, 6].map((n) => (
	[`h${n}`, { fontSize: `${hScale(n)}rem` }]
)))

const App = () => {
	const dark = useMediaQuery('(prefers-color-scheme: dark)')
	const theme = useMemo(
		() => {
			const theme = createTheme({
				typography: hSizes,
				palette: {
					mode: dark ? 'dark' : 'light',
					primary: deepPurple,
				},
			})
			return responsiveFontSizes(theme)
		},
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
						// TODO re-add contrast(200%) before blur without discoloring dark mode
						backdropFilter: 'blur(15px)',
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
