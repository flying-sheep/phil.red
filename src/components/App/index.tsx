import { useMemo } from 'react'
import {
	Route, Routes,
	Navigate,
	useLocation,
	useNavigate,
} from 'react-router-dom'
import { Helmet } from 'react-helmet'

import useMediaQuery from '@mui/material/useMediaQuery'
import CssBaseline from '@mui/material/CssBaseline'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { deepPurple } from '@mui/material/colors'

import Home from '../Home'
import Blog from '../Blog'
import Code from '../Code'
import ElevationScroll from './ElevationScroll'

import styles from './style.css'

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
	const location = useLocation()
	const navigate = useNavigate()

	const currentTab = `/${location.pathname.split('/')[1]}`
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
						<Tabs
							centered
							value={currentTab}
							onChange={(e, value) => navigate(value)}
						>
							<Tab label="Blog" value="/blog"/>
							<Tab label="Home" value="/"/>
							<Tab label="Code" value="/code"/>
						</Tabs>
					</Toolbar>
				</AppBar>
			</ElevationScroll>
			<main className={styles.layout}>
				<Routes>
					<Route index element={<Home/>}/>
					<Route path="blog/*" element={<Blog/>}/>
					<Route path="code" element={<Code/>}/>
					<Route path="*" element={<Navigate replace to="/"/>}/>
				</Routes>
			</main>
		</ThemeProvider>
	)
}

export default App
