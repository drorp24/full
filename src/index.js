import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import Loadable from 'react-loadable'
import { Provider as ReduxProvider } from 'react-redux'
import configureStore from './store/configureStore'

import ApolloClient from 'apollo-client'
import { ApolloProvider } from 'react-apollo'
import { WebSocketLink } from 'apollo-link-ws'
import { split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { getMainDefinition } from 'apollo-utilities'
import { InMemoryCache } from 'apollo-cache-inmemory'

// Create an http link:
const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPHQL_HTTP_ENDPOINT,
})

const wsLink = new WebSocketLink({
  uri: process.env.REACT_APP_GRAPHQL_WS_ENDPOINT,
  options: {
    reconnect: true,
    timeout: 60000,
  },
})

const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpLink
)

const cache = new InMemoryCache()

// apollo client docs discrepancy: link & cache arguments mandatory or not
// import { HttpLink } from 'apollo-link-http'
// import { InMemoryCache } from 'apollo-cache-inmemory'
// const link = new HttpLink({ uri: process.env.REACT_APP_GRAPHQL_ENDPOINT })
// const cache = new InMemoryCache()

const client = new ApolloClient({
  link,
  cache,
})

client.resetStore()

// in dev-only mode (here identified by module.hot), window.REDUX_STATE will still be populated by whatever initial string public/index.html comes with
// as there's no server to replace it with anything
// it's only when server is involved (localhost:3001 or production) that window.REDUX_STATE has an actual state value
const store = configureStore(module.hot ? {} : window.REDUX_STATE || {})

const AppBundle = (
  <React.StrictMode>
    <ApolloProvider client={client}>
      <ReduxProvider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ReduxProvider>
    </ApolloProvider>
  </React.StrictMode>
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
