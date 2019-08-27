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
  REACT_APP_NOSERVER_NOSSR_GRAPHQL_PORT,
  REACT_APP_SERVER_SSR_GRAPHQL_PORT,
  REACT_APP_SERVER_NOSSR_GRAPHQL_PORT,
} = process.env

console.log('graphql client.js:')
console.log(
  'REACT_APP_SERVER, REACT_APP_SSR, REACT_APP_DOMAIN, REACT_APP_ENV_FILE, REACT_APP_NOSERVER_NOSSR_GRAPHQL_PORT, REACT_APP_SERVER_SSR_GRAPHQL_PORT, REACT_APP_SERVER_NOSSR_GRAPHQL_PORT: ',
  REACT_APP_SERVER,
  REACT_APP_SSR,
  REACT_APP_DOMAIN,
  REACT_APP_ENV_FILE,
  REACT_APP_NOSERVER_NOSSR_GRAPHQL_PORT,
  REACT_APP_SERVER_SSR_GRAPHQL_PORT,
  REACT_APP_SERVER_NOSSR_GRAPHQL_PORT
)

const port = JSON.parse(REACT_APP_SERVER)
  ? JSON.parse(REACT_APP_SSR)
    ? REACT_APP_SERVER_SSR_GRAPHQL_PORT
    : REACT_APP_SERVER_NOSSR_GRAPHQL_PORT
  : REACT_APP_NOSERVER_NOSSR_GRAPHQL_PORT

console.log('graphql client port: ', port)

const graphqlEndpoint = `${REACT_APP_DOMAIN}:${port}/graphql`
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
