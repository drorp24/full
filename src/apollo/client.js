import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { ApolloLink, split } from 'apollo-link'
import { onError } from 'apollo-link-error'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import fetch from 'node-fetch'

// SERVER & SSR come from package.json; they serve as command modifiers/arguments (irrespective of environment).
// The others come from multiple .env files; they are environment-specific configuration.
// CRA build enables using multiple files to enable local overrides (not supported by dotenv):
// When run locally, DOMAIN for instance comes from .env.production.local while the others come from .env.production.
const {
  REACT_APP_SERVER,
  REACT_APP_SSR,
  REACT_APP_DOMAIN,
  REACT_APP_ENV_FILE,
  REACT_APP_GRAPHQL_DOMAIN,
  REACT_APP_DEFAULT_GRAPHQL_PORT,
  REACT_APP_NOSERVER_NOSSR_GRAPHQL_PORT,
  REACT_APP_SERVER_SSR_GRAPHQL_PORT,
  REACT_APP_SERVER_NOSSR_GRAPHQL_PORT,
} = process.env

console.log('graphql client.js:')
console.log(
  'REACT_APP_SERVER, REACT_APP_SSR, REACT_APP_DOMAIN, REACT_APP_ENV_FILE, REACT_APP_GRAPHQL_DOMAIN, REACT_APP_DEFAULT_GRAPHQL_PORT, REACT_APP_NOSERVER_NOSSR_GRAPHQL_PORT, REACT_APP_SERVER_SSR_GRAPHQL_PORT, REACT_APP_SERVER_NOSSR_GRAPHQL_PORT: ',
  REACT_APP_SERVER,
  REACT_APP_SSR,
  REACT_APP_DOMAIN,
  REACT_APP_ENV_FILE,
  REACT_APP_GRAPHQL_DOMAIN,
  REACT_APP_DEFAULT_GRAPHQL_PORT,
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
// In a heroku environment, there's only one build command. It is prefixed by no variable assignment.
// While I could define separate scripts for heroku's build as well, it's of no use: heroku will have one server at any given time.
// Furthermore, I would in such case have to pass the value of these variables to the client on a script tag
// if REACT_APP_DEFAULT_GRAPHQL_PORT has value, it means we're in a heroku environment and need only assign that value to the port.
// (heroku also doesn't let you assign port numbers to web servers - see comment in index.js and indexNoSsr.js)

const port =
  REACT_APP_DEFAULT_GRAPHQL_PORT ||
  (JSON.parse(REACT_APP_SERVER)
    ? JSON.parse(REACT_APP_SSR)
      ? REACT_APP_SERVER_SSR_GRAPHQL_PORT
      : REACT_APP_SERVER_NOSSR_GRAPHQL_PORT
    : REACT_APP_NOSERVER_NOSSR_GRAPHQL_PORT)

console.log('NOT CURRENTLY USED: graphql client port: ', port)

const graphqlEndpoint = `${REACT_APP_GRAPHQL_DOMAIN}/graphql`
const httpEndpoint = `http://${graphqlEndpoint}`
const wsEndpoint = `ws://${graphqlEndpoint}`

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
