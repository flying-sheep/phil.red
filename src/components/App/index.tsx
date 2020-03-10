import * as React from 'react'
import {
	RouteComponentProps,
	Route, Switch,
	withRouter,
	Redirect,
} from 'react-router-dom'

import useMediaQuery from '@material-ui/core/useMediaQuery'
import CssBaseline from '@material-ui/core/CssBaseline'
import Toolbar from '@material-ui/core/Toolbar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles'

import Home from '../Home'
import Blog from '../Blog'
import Code from '../Code'

import styles from './style.css'

function App({ location, history }: RouteComponentProps) {
	const dark = useMediaQuery('(prefers-color-scheme: dark)')
	const theme = React.useMemo(
		() => createMuiTheme({
			palette: {
				type: dark ? 'dark' : 'light',
			},
		}),
		[dark],
	)
	
	const currentTab = `/${location.pathname.split('/')[1]}`
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline/>
			<Toolbar>
				<Tabs value={currentTab} onChange={(e, value) => history.push(value)}>
					<Tab label="Home" value="/"/>
					<Tab label="Blog" value="/blog"/>
					<Tab label="Code" value="/code"/>
				</Tabs>
			</Toolbar>
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
