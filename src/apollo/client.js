import { ApolloClient, InMemoryCache, HttpLink } from 'apollo-boost'
import { ApolloLink, split } from 'apollo-link'
import { onError } from 'apollo-link-error'
import { WebSocketLink } from 'apollo-link-ws'
// import { HttpLink } from 'apollo-link-http'
import { getMainDefinition } from 'apollo-utilities'
// import { InMemoryCache } from 'apollo-cache-inmemory'

const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPHQL_HTTP_ENDPOINT,
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
  uri: process.env.REACT_APP_GRAPHQL_WS_ENDPOINT,
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
