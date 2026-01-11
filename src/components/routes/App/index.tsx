import { Helmet } from '@dr.pogodin/react-helmet'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import { deepPurple } from '@mui/material/colors'
import GlobalStyles from '@mui/material/GlobalStyles'
import {
	type ColorSystemOptions,
	createTheme,
	responsiveFontSizes,
	ThemeProvider,
} from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Toolbar from '@mui/material/Toolbar'
import { useMemo, useRef } from 'react'
import { PortalTarget } from 'react-portal-target'
import { Link, matchPath, Route, useLocation } from 'react-router'
import SlideRoutes from 'react-slide-routes'
import { highStyles } from '../../markup/nodes/High'
import Blog from '../Blog'
import Code from '../Code'
import Fallback from '../Fallback'
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

const scaleLinear = (domain: [number, number], range: [number, number]) => {
	const slope = (range[1] - range[0]) / (domain[1] - domain[0])
	const offset = range[0] - slope * domain[0]
	return (x: number) => slope * x + offset
}

const hScale = scaleLinear([1, 6], [3, 1])
const hSizes = Object.fromEntries(
	[1, 2, 3, 4, 5, 6].map((n) => [`h${n}`, { fontSize: `${hScale(n)}rem` }]),
)

const App = () => {
	const theme = useMemo(() => {
		const themeOptions: ColorSystemOptions = {
			palette: {
				primary: deepPurple,
			},
		}
		const baseTheme = createTheme({
			cssVariables: true,
			typography: {
				fontFamily: '"Iosevka Aile", sans-serif',
				...hSizes,
			},
			colorSchemes: {
				light: themeOptions,
				dark: themeOptions,
			},
		})
		return responsiveFontSizes(baseTheme)
	}, [])
	const currentTab = useRouteMatch(ROUTE_LINKS.map(({ pattern }) => pattern))
		?.pattern.path
	const bar = useRef<HTMLElement>(null)

	return (
		<ThemeProvider theme={theme}>
			<Helmet>
				<title>phil.red</title>
			</Helmet>
			<CssBaseline />
			<GlobalStyles styles={highStyles} />
			<ElevationScroll>
				<AppBar
					ref={bar}
					position="sticky"
					sx={{
						color: theme.vars.palette.text.primary,
						background: `color(from ${theme.vars.palette.background.default} / 0.7)`,
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
					mx: 'auto',
					p: 3,
					// Add space for the header when navigating to anchors
					'& :target': { scrollMarginTop: bar.current?.offsetHeight },
				}}
			>
				<SlideRoutes>
					<Route path="blog/*" element={<Blog />} />
					<Route index element={<Home />} />
					<Route path="code" element={<Code />} />
					<Route path="*" element={<Fallback />} />
				</SlideRoutes>
			</Box>
			<PortalTarget name="page-source" />
		</ThemeProvider>
	)
}

export default App
