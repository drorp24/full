import React, { Component, Suspense, lazy } from 'react'
import { Route, withRouter, Switch, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { setMessage, setCount } from './redux/actions'

import 'typeface-roboto'

import { ThemeProvider } from '@material-ui/styles'
import theme from './components/themed/theme'

import Select from './components/app/Select'

import ErrorBoundary from './components/utility/ErrorBoundary'
import Loader from './components/utility/Loader'

const Merchants = lazy(() => import('./components/app/Merchants'))

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
        <ThemeProvider theme={theme}>
          {/* ! ErrorBoundary must be beneath ThemeProvider */}
          <ErrorBoundary level="page">
            <Switch>
              <Redirect exact from="/" to="/select" />
              <Route path="/select" component={Select} />
              <Route path="/merchants">
                {this.props.values && this.props.values.quote ? (
                  <Suspense fallback={<Loader />}>
                    <Merchants />
                  </Suspense>
                ) : (
                  <Redirect to="/select" />
                )}
              </Route>
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
    ({ text: { message }, counter: { count }, form: { values } }) => ({
      message,
      count,
      values,
    }),
    {
      setMessage,
      setCount,
    }
  )(App)
)
