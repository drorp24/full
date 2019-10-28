import './index.css'
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'

import App from './App'
import registerServiceWorker from './registerServiceWorker'
import Loadable from 'react-loadable'

import { Provider as ReduxProvider } from 'react-redux'
import configureStore from './redux/configureStore'
import { PersistGate } from 'redux-persist/integration/react'

import { ApolloProvider } from 'react-apollo'
import client from '../src/apollo/client'

import {
  isIos,
  isInStandaloneMode,
  inBrowser,
} from '../src/components/utility/detect'

// TODO: Must try the function way
// To beat this thing once and for all, I must try the function way first (only then record my learnings)
// because what I've done here and in client.js is an ugly workaround instead of the solution.
// While the if's saved me from the problems, I don't want *any* of that code, nor client.js, to run on the server
// (effectively, that's what I'm doing here, defining a lot of const's and then doing nothing unless we're inTheBrowser).
//
// I don't have a clue how this file got to be run on the server at all, let alone before the server/index etc
// It's not in the tree of calls!
// What's more puzzling is that it did succeed in ssr quite many times before.
// I do notice that the code is not included in any function.
// I do notice that *all* issues, which I gradually fixed, occured at Merchant.js line 62 which is:
// import { BrowserContext } from '../../index'
// - and this explains why the change in behavior: this is indeed a new line!
// - so app/src/index.js *was* in the tree after all. It's Merchant who put included it there.
// I'm including the index for the first time....got it 🤓
// By importing BrowserContext from app/src.index.js I somehow made the other definitions be evaluated too, though
// they aren't related.
// TODO:
// - place BrowserContext code in a file of its own, so as to not import anything from app/src/index.js
// - revert the fixes I just did (keep them of course befirehand) and check if the problems ceased to exist
// - consider moving the device/browser details to redux instead of using BrowserContext (only if 1 min work!)

// And plenty of other (not needed) files too, only they didn't refer to 'window' so no complaint was heard
// (registerServiceWorker did, and I had to fix it - which was indeed odd to me then)

const ssr = process.env.REACT_APP_SSR
const inTheBrowser = inBrowser()

const storeConfig = configureStore(
  ssr && inTheBrowser ? window.REDUX_STATE || {} : {}
)
const { store, persistor } = storeConfig

// ! Device info - React context vs. Redux
// I could have placed device and browser details in redux, saving myself the extra context layer here
// and gaining a consolidated place for all metadata, with redux having both 'user' and 'device' keys.
// That info would also be persisted, but I'm not sure I'd want all device properties to be persisted.
// And I'd have to exclude it from redux initialization, as it happens on the server as well, where all this info is unavailable
// The fact this file runs only on the client by definition made me choose putting this logic here and not in redux.
export const BrowserContext = React.createContext()
const browserContext = inTheBrowser
  ? {
      isIos: isIos(),
      isInStandaloneMode: isInStandaloneMode(),
      nativeInstall: null,
    }
  : {}

if (inTheBrowser) {
  window.addEventListener('beforeinstallprompt', e => {
    // This event is fired by Chrome on mobile (and desktop) to signal that app is qualified to be installed ('add to home screen / A2HS')
    // The event also allows getting the native prompt (e.prompt()) and, when the
    // (note: If I use the native prompt (nativeInstall.prompt()) then I would end up with inconsistent iOS vs. Android experience).
    browserContext.nativeInstall = e
  })
}

// Wrap <App /> here with browser-specific components only
//(put server-specific ones in server/middleware/renderer)
// Common stuff (e.g., theme) should be included in <App />
const AppBundle = (
  // <React.StrictMode>
  <ApolloProvider client={client}>
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <BrowserContext.Provider value={browserContext}>
            <App />
          </BrowserContext.Provider>
        </BrowserRouter>
      </PersistGate>
    </ReduxProvider>
  </ApolloProvider>
  // </React.StrictMode>
)

if (inTheBrowser) {
  const root = document.getElementById('root')
  window.onload = () => {
    // if ssr is not on there's nothing to hydrate
    // calling ReactDOM.hydrate in this case will result with a 'matching <div>' warning message (why?)
    // calling ReactDOM.render in such case prevents the warning from appearing
    const renderMethod = ssr ? ReactDOM.render : ReactDOM.hydrate
    Loadable.preloadReady().then(() => {
      renderMethod(AppBundle, root)
    })
  }
  registerServiceWorker()
}
