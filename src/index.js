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

import { isIos, isInStandaloneMode } from '../src/components/utility/detect'

const ssr = process.env.REACT_APP_SSR

const storeConfig = configureStore(ssr ? window.REDUX_STATE || {} : {})
const { store, persistor } = storeConfig

// ! Device info - React context vs. Redux
// I could have placed device and browser details in redux, saving myself the extra context layer here
// and gaining a consolidated place for all metadata, with redux having both 'user' and 'device' keys.
// That info would also be persisted, but I'm not sure I'd want all device properties to be persisted.
// And I'd have to exclude it from redux initialization, as it happens on the server as well, where all this info is unavailable
// The fact this file runs only on the client by definition made me choose putting this logic here and not in redux.
export const BrowserContext = React.createContext()
const browserContext = {
  isIos: isIos(),
  isInStandaloneMode: isInStandaloneMode(),
  nativeInstall: null,
}

window.addEventListener('beforeinstallprompt', e => {
  // This event is fired by Chrome on mobile (and desktop) to signal that app is qualified to be installed ('add to home screen / A2HS')
  // The event also allows getting the native prompt (e.prompt()) and, when the
  // (note: If I use the native prompt (nativeInstall.prompt()) then I would end up with inconsistent iOS vs. Android experience).
  browserContext.nativeInstall = e
})

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
