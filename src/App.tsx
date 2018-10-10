import * as React from 'react'
import { Route, Switch, withRouter, RouteComponentProps } from 'react-router-dom'

import CssBaseline from '@material-ui/core/CssBaseline'
import AppBar from '@material-ui/core/Toolbar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'

import Blog from './components/Blog'


function App({ location, history }: RouteComponentProps) {
	const currentTab = `/${location.pathname.split('/')[1]}`
	return (
		<>
			<CssBaseline/>
			<AppBar>
				<Tabs value={currentTab} onChange={(e, value) => history.push(value)}>
					<Tab label="Home" value="/"/>
					<Tab label="Blog" value="/blog"/>
				</Tabs>
			</AppBar>
			<Switch>
				<Route path="/" exact component={() => <span>Home</span>}/>
				<Route path="/blog" component={Blog}/>
				<Route render={() => <span>No Match</span>}/>
			</Switch>
		</>
	)
}

export default withRouter(App)
