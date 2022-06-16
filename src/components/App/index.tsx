import * as React from 'react'
import {
	RouteComponentProps,
	Route, Switch,
	withRouter,
	Redirect,
} from 'react-router-dom'

import useMediaQuery from '@mui/material/useMediaQuery'
import CssBaseline from '@mui/material/CssBaseline'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { deepPurple } from '@mui/material/colors';

import Home from '../Home'
import Blog from '../Blog'
import Code from '../Code'
import ElevationScroll from './ElevationScroll'

import styles from './style.css'

function App({ location, history }: RouteComponentProps) {
	const dark = useMediaQuery('(prefers-color-scheme: dark)')
	const theme = React.useMemo(
		() => createTheme({
			palette: {
				mode: dark ? 'dark' : 'light',
				primary: deepPurple,
			},
		}),
		[dark],
	)
	
	const currentTab = `/${location.pathname.split('/')[1]}`
	return (
		<ThemeProvider theme={theme}>
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
							onChange={(e, value) => history.push(value)}
						>
							<Tab label="Blog" value="/blog"/>
							<Tab label="Home" value="/"/>
							<Tab label="Code" value="/code"/>
						</Tabs>
					</Toolbar>
				</AppBar>
			</ElevationScroll>
			<main className={styles.layout}>
				<Switch>
					<Route path="/" exact component={Home}/>
					<Route path="/blog" component={Blog}/>
					<Route path="/code" component={Code}/>
					<Redirect to="/"/>
				</Switch>
			</main>
		</ThemeProvider>
	)
}

export default withRouter(App)
