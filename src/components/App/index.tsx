import { useMemo } from 'react'
import {
	Link,
	Route,
	Navigate,
	useLocation,
	matchPath,
} from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

import useMediaQuery from '@mui/material/useMediaQuery'
import CssBaseline from '@mui/material/CssBaseline'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { deepPurple } from '@mui/material/colors'

import SlideRoutes from 'react-slide-routes'
import Home from '../Home'
import Blog from '../Blog'
import Code from '../Code'
import ElevationScroll from './ElevationScroll'

import styles from './style.css'

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

function App() {
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
						background: theme.palette.background.default,
					}}
				>
					<Toolbar component="nav" classes={{ root: styles.toolbar }}>
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
			<main className={styles.layout}>
				<SlideRoutes>
					<Route path="blog/*" element={<Blog/>}/>
					<Route index element={<Home/>}/>
					<Route path="code" element={<Code/>}/>
					<Route path="*" element={<Navigate replace to="/"/>}/>
				</SlideRoutes>
			</main>
		</ThemeProvider>
	)
}

export default App
