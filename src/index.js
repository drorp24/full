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

import ApolloProviderClient from './apollo/ApolloProviderClient'

import { initiateDeviceProperties } from './components/utility/deviceProperties'

const ssr = process.env.REACT_APP_SSR

const storeConfig = configureStore(ssr ? window.REDUX_STATE || {} : {})
const { store, persistor } = storeConfig

// ! Device info - React context vs. Redux
// I could have placed device and browser details in redux, saving myself the extra context layer here
// and gaining a consolidated place for all metadata, with redux having both 'user' and 'device' keys.
// That info would also be persisted, but I'm not sure I'd want all device properties to be persisted.
// And I'd have to exclude it from redux initialization, as it happens on the server as well, where all this info is unavailable
// The fact this file runs only on the client by definition made me choose putting this logic here and not in redux.

// Wrap <App /> here with browser-specific components only
//(put server-specific ones in server/middleware/renderer)
// Common stuff (e.g., theme) should be included in <App />
const AppBundle = (
  <ApolloProviderClient>
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PersistGate>
    </ReduxProvider>
  </ApolloProviderClient>
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

// ! Use Redux not React.Context when there is no component to hang to
// 'registerServiceWorker' must be run upon window.load, i.e., before any component is rendered
// (putting code inside a window.onload in a component's useEffect will do nothing: the onload event will be missed)
// if I need to write something in a place "everyone can see", there is no component to attach a hook such as useSelector or useContext.
// Redux to the rescue:
// Passing 'store' into registerServiceWorker enables it to access 'dispatch' with store.dispatch with no hook or old-fashioned connect.
//
// 'initiateDeviceProperties' even manages to dispatch a thunk.
registerServiceWorker(store)
initiateDeviceProperties(store)
