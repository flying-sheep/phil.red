import * as React from 'react'
import {
	RouteComponentProps,
	Route, Switch,
	withRouter,
	Redirect,
} from 'react-router-dom'

import {
	CssBaseline, Tab, Tabs, Toolbar,
} from '@material-ui/core'

import Home from '../Home'
import Blog from '../Blog'
import Code from '../Code'

import styles from './style.css'


function App({ location, history }: RouteComponentProps) {
	const currentTab = `/${location.pathname.split('/')[1]}`
	return (
		<>
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
		</>
	)
}

export default withRouter(App)
