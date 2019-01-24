import React, { Component } from 'react'
import { Route, withRouter, Switch, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { setMessage, setCount } from './store/actions'

import Practice from './components/sync/Practice'
import TradingUpdated from './components/graphql/TradingUpdated'
import Topics from './components/sync/Topics'
import AsyncLazyComponent from './components/async/lazy/AsyncLazyComponent'
import Trading from './components/graphql/Trading'
import CryptoChart from './components/websocket/CryptoChart'
// import CryptoChartUsingHooks from './components/websocket/CryptoChartUsingHooks'
import Merchants from './components/graphql/Merchants'
import AsyncNotInitialRender from './components/async/notInitialRender/AsyncNotInitialRender'
import SearchForm from './components/forms/homemade/Wizard'
import { ThemeProvider } from '@material-ui/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import 'typeface-roboto'
import theme from './components/themed/theme'

console.log('theme: ', theme)

class App extends Component {
  componentDidMount() {
    if (!this.props.message) {
      this.props.setMessage('Client')
    }
    // This hack puts the hook stylesheet that has every custom styling last so it can really override
    // Not clear why MUI put it first; since i'm using an alpha version of hooks, this might be a bug
    const head = document.getElementsByTagName('head')[0]
    const hookStylesheet = document.querySelectorAll('style[data-meta=Hook]')[0]
    if (hookStylesheet) head.insertBefore(hookStylesheet, null)
  }

  render() {
    return (
      <>
        <CssBaseline />
        <ThemeProvider theme={theme}>
          <Switch>
            <Redirect exact from="/" to="/select" />
            <Route path="/select" component={SearchForm} />
            <Route path="/practice" component={Practice} />
            <Route path="/cryptochart" component={CryptoChart} />
            {/* <Route
        	      path="/cryptochartUsingHooks"
        	      component={CryptoChartUsingHooks}
        	  /> */}
            <Route path="/realtimetrading/" component={TradingUpdated} />
            <Route path="/trading" component={Trading} />

            <Route path="/merchants" component={Merchants} />

            <Route
              path="/asyncNotInitialRender"
              component={AsyncNotInitialRender}
            />
            <Route path="/asyncLazyComponent" component={AsyncLazyComponent} />

            <Route path="/topics" component={Topics} />
          </Switch>
        </ThemeProvider>
      </>
    )
  }
}

// using mapDispatchToProps' short-hand version as it's so much clearer
// most use the long version for no reason, having to use a different prop name
export default withRouter(
  connect(
    ({ text: { message }, counter: { count } }) => ({
      message,
      count,
    }),
    {
      setMessage,
      setCount,
    }
  )(App)
)
