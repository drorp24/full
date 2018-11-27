import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import Loadable from 'react-loadable'
import { Provider as ReduxProvider } from 'react-redux'
import configureStore from './store/configureStore'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'

// apollo client docs discrepancy: link & cache arguments mandatory or not
const uri = process.env.REACT_APP_GRAPHQL_ENDPOINT
// import { HttpLink } from 'apollo-link-http'
// import { InMemoryCache } from 'apollo-cache-inmemory'
// const link = new HttpLink({ uri: process.env.REACT_APP_GRAPHQL_ENDPOINT })
// const cache = new InMemoryCache()

const client = new ApolloClient({
  uri,
})

// in dev-only mode (here identified by module.hot), window.REDUX_STATE will still be populated by whatever initial string public/index.html comes with
// as there's no server to replace it with anything
// it's only when server is involved (localhost:3001 or production) that window.REDUX_STATE has an actual state value
const store = configureStore(module.hot ? {} : window.REDUX_STATE || {})

const AppBundle = (
  <ApolloProvider client={client}>
    <ReduxProvider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ReduxProvider>
  </ApolloProvider>
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
