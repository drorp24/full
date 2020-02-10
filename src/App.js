import React, { useMemo } from 'react'
import { Route, withRouter, Switch, Redirect } from 'react-router-dom'
import { connect, useSelector } from 'react-redux'
import { setMessage, setCount } from './redux/actions'

import 'typeface-roboto'

import { ThemeProvider } from '@material-ui/styles'
import theme from './components/themed/theme'

import ErrorBoundary from './components/utility/ErrorBoundary'
// import Loader from './components/utility/Loader'

import Welcome from './components/app/Welcome'
import Index from './components/app/Index'
import Select from './components/app/Select'
import Merchants from './components/app/Merchants'
// const Merchants = lazy(() => import('./components/app/Merchants'))

function App({ values }) {
  // componentDidMount() {
  //   // Commented: peel off the <style> placed by the server, as React will create them again on its own.
  //   // While this is the instruction of MUI, turns out the name of the makeStyles classes generated by React when it hydrates
  //   // are different than the ones placed the the server on the DOM elements; and since those do not change upon hydration,
  //   // the result is a mismatch and no styling. Leaving the styles created by the server is the only way to maintain the styling post hydration.
  //   // Unlike the makeStyles, the MUI's native class names (mui-xxx) are generated correctly upon hydration, making those just appear twice.
  //   // Since I'm keeping ssr for the first, static page only, this is not too terrible.
  //   const jssStyles = document.querySelector('#jss-server-side')
  //   if (jssStyles) {
  //     // jssStyles.parentElement.removeChild(jssStyles)
  //   }

  //   if (!this.props.message) {
  //     this.props.setMessage('Client')
  //   }

  //   // This hack puts the hook stylesheet that has every custom styling last so it can really override
  //   // Not clear why MUI put it first; since i'm using an alpha version of hooks, this might be a bug
  //   const head = document.getElementsByTagName('head')[0]
  //   const hookStylesheet = document.querySelectorAll('style[data-meta=Hook]')[0]

  //   if (hookStylesheet) head.insertBefore(hookStylesheet, null)
  // }

  // const OsDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const mode = useSelector(store => store.device.mode)
  const modeTheme = useMemo(() => theme(mode), [mode])

  return (
    <ThemeProvider theme={modeTheme}>
      {/* ! ErrorBoundary must be beneath ThemeProvider */}
      <ErrorBoundary level="page">
        <Switch>
          <Route exact path="/">
            <Welcome />
          </Route>
          <Route path="/select">
            <Select />
          </Route>
          <Route path="/merchants">
            {values && values.quote ? <Merchants /> : <Redirect to="/select" />}
          </Route>
        </Switch>
      </ErrorBoundary>
    </ThemeProvider>
  )
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
