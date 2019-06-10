import React, { Component } from 'react'
import { Route, withRouter, Switch, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { setMessage, setCount } from './redux/actions'

import 'typeface-roboto'

import { ThemeProvider } from '@material-ui/styles'

import CssBaseline from '@material-ui/core/CssBaseline'
import theme from './components/themed/theme'

import Practice from './components/sync/Practice'
import TradingUpdated from './components/graphql/TradingUpdated'
import Topics from './components/sync/Topics'
import AsyncLazyComponent from './components/async/lazy/AsyncLazyComponent'
import Trading from './components/graphql/Trading'
// import CryptoChart from './components/websocket/CryptoChart'
// import CryptoChartUsingHooks from './components/websocket/CryptoChartUsingHooks'
import Merchants from './components/app/Merchants'
import Try from './components/utility/Try'
import AsyncNotInitialRender from './components/async/notInitialRender/AsyncNotInitialRender'
// import Wizard from './components/forms/homemade/Wizard'

import Select from './components/app/Select'
import Delivery from './components/app/Delivery'

import { measure } from './components/utility/performance'
import moize from 'moize'
import Dashboard from './components/utility/Dashboard'
import ErrorBoundary from './components/utility/boundary'

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

    window.measure = measure
    moize.collectStats()
    window.moize = moize
  }

  render() {
    return (
      <>
        <CssBaseline />
        <ThemeProvider theme={theme}>
          {/* ! ErrorBoundary must be beneath ThemeProvider */}
          <ErrorBoundary>
            <Switch>
              <Redirect exact from="/" to="/select" />
              <Route path="/select" component={Select} />
              <Route path="/delivery" component={Delivery} />
              {/* <Route path="/next" component={Next} /> */}
              <Route path="/dashboard" component={Dashboard} />
              {/* <Route path="/wizard" component={Wizard} /> */}
              <Route path="/practice" component={Practice} />
              {/* <Route path="/cryptochart" component={CryptoChart} /> */}
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
              <Route
                path="/asyncLazyComponent"
                component={AsyncLazyComponent}
              />
              <Route path="/topics" component={Topics} />
              <Route path="/try" component={Try} />
            </Switch>
          </ErrorBoundary>
        </ThemeProvider>
      </>
    )
  }
}

// using mapDispatchToProps' short-hand version as it's so much clearer
// most use the long version for no reason, having to use a different prop name
export default withRouter(
  connect(
    ({ text: { message }, counter: { count }, search }) => ({
      message,
      count,
      search,
    }),
    {
      setMessage,
      setCount,
    }
  )(App)
)
