import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { ApolloLink, split } from 'apollo-link'
import { onError } from 'apollo-link-error'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import fetch from 'node-fetch'

// ! Environment Variables' source madness
// SERVER & SSR come from package.json; they are *not* environment-specific
// They are run modes: static server vs HMR, ssr vs noSsr etc
//
// The others are environment dependenant. They and from:
//
// - CRA HMR server -
//   .env.development file
// - Express server serving CRA-built ("react-scripts build") static files/chunks in LOCAL ENVIRONMENT -
//   .env.production.local overriding .env.production (a CRA feature, not a .dotenv one)
//   CRA will use '.production' files even if the value of NODE_ENV is development and regardless if the mode is ssr or noSsr
// - Express server serving CRA-built ("react-scripts build") static files/chunks in HEROKU -
//   Heroku environment variables
// - Express server serving babel-built ("babel src -d dist") static files/chunks in LOCAL ENVIRONMENT -
//   .env files, but .dotenv allows configuring any other file for it (e.g., "dotenv_config_path=.env.production")
// - Express server serving babel-built ("babel src -d dist") static files/chunks in HEROKU -
//   Heroku environment variables
//
//   Note: variables representing boolean values must be JSON.parsed or else "false" would be considered "true"
//
const {
  REACT_APP_ENV_FILE,
  REACT_APP_SERVER,
  REACT_APP_SSR,
  REACT_APP_GRAPHQL_WEB_SCHEME,
  REACT_APP_GRAPHQL_WEBSOCKET_SCHEME,
  REACT_APP_GRAPHQL_DOMAIN,
  REACT_APP_GRAPHQL_PORT_REQUIRED,
  REACT_APP_NOSERVER_NOSSR_GRAPHQL_PORT,
  REACT_APP_SERVER_SSR_GRAPHQL_PORT,
  REACT_APP_SERVER_NOSSR_GRAPHQL_PORT,
} = process.env

console.log('graphql client.js:')
console.log(
  'REACT_APP_GRAPHQL_PORT_REQUIRED: ',
  REACT_APP_GRAPHQL_PORT_REQUIRED
)
console.log(
  'REACT_APP_ENV_FILE, REACT_APP_SERVER, REACT_APP_SSR, REACT_APP_GRAPHQL_WEB_SCHEME, REACT_APP_GRAPHQL_WEBSOCKET_SCHEME, REACT_APP_GRAPHQL_DOMAIN, REACT_APP_GRAPHQL_PORT_REQUIRED, REACT_APP_NOSERVER_NOSSR_GRAPHQL_PORT, REACT_APP_SERVER_SSR_GRAPHQL_PORT, REACT_APP_SERVER_NOSSR_GRAPHQL_PORT: ',
  REACT_APP_ENV_FILE,
  JSON.parse(REACT_APP_SERVER),
  JSON.parse(REACT_APP_SSR),
  REACT_APP_GRAPHQL_WEB_SCHEME,
  REACT_APP_GRAPHQL_WEBSOCKET_SCHEME,
  REACT_APP_GRAPHQL_DOMAIN,
  JSON.parse(REACT_APP_GRAPHQL_PORT_REQUIRED),
  REACT_APP_NOSERVER_NOSSR_GRAPHQL_PORT,
  REACT_APP_SERVER_SSR_GRAPHQL_PORT,
  REACT_APP_SERVER_NOSSR_GRAPHQL_PORT
)

// in a local environment (only), each of the 3 web servers (CRA's HMR, server with ssr, server with no ssr) is assigned its own different port number.
// That enables running locally a CRA server alongside a production-like server w/o having to kill processes with identical ports.
// Graphql endpoints have to be assigned accordingly as well, to have each web client talk with its own separate graphql server.
// Each of the 3 servers has its own script line in package.json that prefixes the 'build' command with the proper variables/arguments
// The value of these variables are thus embedded by the build and are available thru process.env.
// All this is not possiblenor required in heroku.
//
// Heroku doesn't like the graphql port number to be specified as much as it doesn't with web servers
// port number assignment is therefore restricted to dev mode

let graphqlEndpoint
if (JSON.parse(REACT_APP_GRAPHQL_PORT_REQUIRED)) {
  console.log('inside the if!!!')
  const port = JSON.parse(REACT_APP_SERVER)
    ? JSON.parse(REACT_APP_SSR)
      ? REACT_APP_SERVER_SSR_GRAPHQL_PORT
      : REACT_APP_SERVER_NOSSR_GRAPHQL_PORT
    : REACT_APP_NOSERVER_NOSSR_GRAPHQL_PORT

  graphqlEndpoint = `${REACT_APP_GRAPHQL_DOMAIN}:${port}/graphql`
} else {
  console.log('skipped the if')
  graphqlEndpoint = `${REACT_APP_GRAPHQL_DOMAIN}/graphql`
}

console.log('graphqlEndpoint: ', graphqlEndpoint)

const httpEndpoint = `${REACT_APP_GRAPHQL_WEB_SCHEME}://${graphqlEndpoint}`
const wsEndpoint = `${REACT_APP_GRAPHQL_WEBSOCKET_SCHEME}://${graphqlEndpoint}`

const httpLink = new HttpLink({
  uri: httpEndpoint,
  fetch: fetch,
})

// errorLink is the only way to identify   errors coming from the server
// particularly when the query is wrongly structured or the data makes it fail (both yielding status 400)
const errorLink = onError(
  ({ operation, response, graphQLErrors, networkError }) => {
    console.log('errorLink:')
    // Nice hack to safely access deeply nested obj keys
    console.log('networkError: ', networkError)
    console.log(
      'query: ',
      (((operation.query || {}).loc || {}).source || {}).body || {}
    )
    console.log('graphQLErrors: ', graphQLErrors)
  }
)

console.log('wsEndpoint: ', wsEndpoint)
console.log('httpEndpoint: ', httpEndpoint)

// const wsClient = new SubscriptionClient(wsEndpoint, {
//   reconnect: true,
// })

// const wsLink = WebSocketLink(wsClient)

const wsLink = new WebSocketLink({
  uri: wsEndpoint,
  options: {
    reconnect: true,
    timeout: 60000,
  },
})

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  ApolloLink.from([errorLink, httpLink])
)

const cache = new InMemoryCache()

const client = new ApolloClient({
  link,
  cache,
})

export default client
