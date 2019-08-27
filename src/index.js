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

const ssr = process.env.REACT_APP_SSR

const storeConfig = configureStore(ssr ? window.REDUX_STATE || {} : {})
const { store, persistor } = storeConfig

// Wrap <App /> here with browser-specific components only
//(put server-specific ones in server/middleware/renderer)
// Common stuff (e.g., theme) should be included in <App />
const AppBundle = (
  // <React.StrictMode>
  <ApolloProvider client={client}>
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <App />
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
