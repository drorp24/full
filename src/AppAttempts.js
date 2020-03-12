import React, { useMemo, useEffect, useState, lazy, Suspense } from 'react'
import { Route, withRouter, Switch, Redirect } from 'react-router-dom'
import { connect, useSelector, useDispatch } from 'react-redux'
import { setSource, setCount, setDevice } from './redux/actions'

// ! WHY I SAVED THIS FILE
//
// SSR + code split are blocked for anyone using CRA. react-loadable is obsolete and loadable-components requires access to webpack and babel configs.
// This code below is as far as I could come close to a home-made SSR+split.
// I'm saving it since it's only a matter of understanding what have I missed to make this work.
// Currently for the life of me I cannot make it work.
// What I notice:
// - setSelect makes parent 'App' re-render for some reason, in spite of being embedded in 'LazySelect';
//   'App' re-rendering re-initializes 'Select's state back into 'load', which breaks the protective 'if (Select !== 'load') return' statement,
//   creating an endless loop. 'Select' itself renders properly.
// - an attempt to use a local variable instead of the setSelect hook (left commented) prevented the endless loop,
//   but didn't trigger any re-render either, making the initial 'load' value hang and never replaced with 'Select'.
//
// I'm treating here code as React treats data, and maybe this is the culprit.
// If I ever (hpe not!) try doing that again, I may try:
// - Return to React.lazy and focus on server not minding <Suspense />
// - or stick with this home-made React.lazy and use some Suspense-like component of my own.

// ! Why I gave up custom fonts
//  Usually, custom fonts are lazily fetched only when required.
//  That prevents the browser from having to fetch font files in the first page, which I deliberately
//  didn't style with any custom font for performance.
//  But webpack include all 16 versions of every font in its precache-manifest file,
//  which Workbox then greedily fetches at precaching time.
//  This not only takes time but fills the network tab and sw cache with lots of files,
//  most of which will never be used.
//  Roboto seems to be the browsers' default anyway.
//
// import 'typeface-roboto'

import { ThemeProvider } from '@material-ui/styles'
import theme from './components/themed/theme'

import ErrorBoundary from './components/utility/ErrorBoundary'
import Welcome from './components/app/Welcome'
// import Loader from './components/utility/Loader'

import Merchants from './components/app/Merchants'
// import Select from './components/app/Select'
// const Select = lazy(() =>
//   import(/* webpackChunkName: "Select" */ './components/app/Select').then(
//     component => {
//       console.log('component: ', component)
//     }
//   )
// )
// const Merchants = lazy(() => import('./components/app/Merchants'))

function App({ values }) {
  // componentDidMount() {
  // Commented: peel off the <style> placed by the server, as React will create them again on its own.
  // While this is the instruction of MUI, turns out the name of the makeStyles classes generated by React when it hydrates
  // are different than the ones placed the the server on the DOM elements; and since those do not change upon hydration,
  // the result is a mismatch and no styling. Leaving the styles created by the server is the only way to maintain the styling post hydration.
  // Unlike the makeStyles, the MUI's native class names (mui-xxx) are generated correctly upon hydration, making those just appear twice.
  // Since I'm keeping ssr for the first, static page only, this is not too terrible.
  //   const jssStyles = document.querySelector('#jss-server-side')
  //   if (jssStyles) {
  // jssStyles.parentElement.removeChild(jssStyles)
  //   }

  //   if (!this.props.source) {
  //     this.props.setSource('Client')
  //   }

  //   // This hack puts the hook stylesheet that has every custom styling last so it can really override
  //   // Not clear why MUI put it first; since i'm using an alpha version of hooks, this might be a bug
  //   const head = document.getElementsByTagName('head')[0]
  //   const hookStylesheet = document.querySelectorAll('style[data-meta=Hook]')[0]

  //   if (hookStylesheet) head.insertBefore(hookStylesheet, null)
  // }

  // MUI's 'useMediaQuery' in this case would provide the wrong result
  // window.matchMedia should be used whenever possible

  // ! Mode selection & ssr
  // Since <ThemeProvider /> wraps the entire app, deciding what the mode is ('light' or 'dark') must come first.
  // That goes for the server too, as it needs to know how to color the rendered page.
  // (I've decided to not save a few milliseconds by inlining styles on the first rendered page
  // and instead save my time and the certain bugs which would likely follow with every change of the theme).
  //
  // Server doesn't know what the user prefers so it will go with 'dark' as default and color the returned page accordingly;
  // That means it would also return the value 'dark' in its embedded serialized REDUX.
  //
  // Server doesn't record its 'dark' default in the 'device' redux selector, returning null there;
  // Even if it did, client would not have mistaken it to be the user's choice as 'source' would indicate the value's source is the server.
  //
  // As soon as client takes over and populates its own values it sets 'source' to 'Client',
  // thus ensuring that client would only override server-generated values, not its own.
  //

  const dispatch = useDispatch()

  const userSetMode = useSelector(
    store => store.source === 'Client' && store.device.mode
  )
  const [mode, setMode] = useState('dark')

  const LazySelect = () => {
    const [Select, setSelect] = useState('load')
    // let Select = 'load'
    console.log('LazySelect entered')

    useEffect(() => {
      if (Select !== 'load') return
      console.log('entered LazySelect import useEffect')
      import(/* webpackChunkName: "Select" */ './components/app/Select')
        .then(imported => {
          console.log('select imported.default: ', imported.default)
          console.log('before setSelect')
          setSelect(imported.default)
          // Select = imported.default
          console.log('after setSelect')
          console.log('Select: ', Select)
        })
        .catch(e => {
          console.log('e:', e)
        })
    }, [Select])

    console.log('Select: ', Select)

    return <div>{Select}</div>
  }

  const [inClient, setInClient] = useState(false)

  useEffect(() => {
    setInClient(true)
    console.log('entered mode useEffect')
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const DarkMatches = mql ? mql.matches : null
    const userOSMode = DarkMatches ? 'dark' : 'light'

    const mode = userSetMode || userOSMode

    setMode(mode)
    dispatch(setDevice({ mode }))
    dispatch(setSource('Client'))
  }, [userSetMode, dispatch])

  const modeTheme = useMemo(() => theme(mode), [mode])

  const Suspend = ({ children }) => {
    console.log('>>>>>>>> Suspend called')
    console.log('inClient: ', inClient)
    console.log('children: ', children)
    return inClient ? (
      // <div>ho</div>
      <LazySelect />
    ) : (
      <div>hi</div>
    )
  }

  console.log('App called')

  return (
    <ThemeProvider theme={modeTheme}>
      <ErrorBoundary level="page">
        <Switch>
          <Route exact path="/">
            <Welcome />
          </Route>
          <Route path="/select">
            <LazySelect />
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
    ({ source, counter: { count }, form: { values } }) => ({
      source,
      count,
      values,
    }),
    {
      setSource,
      setCount,
    }
  )(App)
)
