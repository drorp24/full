import './bootstrap'
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

// in dev-only mode (here identified by module.hot), window.REDUX_STATE will still be populated by whatever initial string public/index.html comes with
// as there's no server to replace it with anything
// it's only when server is involved (localhost:3001 or production) that window.REDUX_STATE has an actual state value
const storeConfig = configureStore(module.hot ? {} : window.REDUX_STATE || {})
const { store, persistor } = storeConfig

// Wrap <App /> here with browser-specific components only
//(put server-specific ones in server/middleware/renderer)
// Common stuff (e.g., theme) should be included in <App />
const AppBundle = (
  // <React.StrictMode>
  <ApolloProvider client={client}>
    <ReduxProvider store={store}>
      {/* <PersistGate loading={null} persistor={persistor}> */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
      {/* </PersistGate> */}
    </ReduxProvider>
  </ApolloProvider>
  // </React.StrictMode>
)

const root = document.getElementById('root')

window.onload = () => {
  // in dev-only mode (no server, e.g.: localhost:3000), there's nothing to hydrate
  // calling ReactDOM.hydrate in this case will result with a 'maching <div>' warning message
  // calling ReactDOM.render in this case prevents the warning from appearing
  const renderMethod = module.hot ? ReactDOM.render : ReactDOM.hydrate
  Loadable.preloadReady().then(() => {
    renderMethod(AppBundle, root)
  })
}

registerServiceWorker()
