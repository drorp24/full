import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import Loadable from 'react-loadable'
import { Provider as ReduxProvider } from 'react-redux'
import configureStore from './store/configureStore'

const store = configureStore(window.REDUX_STATE || {})

const AppBundle = (
  <ReduxProvider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ReduxProvider>
)

const root = document.getElementById('root')

window.onload = () => {
  Loadable.preloadReady().then(() => {
    ReactDOM.hydrate(AppBundle, root)
  })
}

registerServiceWorker()
