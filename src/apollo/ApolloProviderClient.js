import React, { useState, useEffect } from 'react'
import { ApolloClient } from 'apollo-client'
import { ApolloProvider } from 'react-apollo'

import { InMemoryCache } from 'apollo-cache-inmemory'
import { persistCache } from 'apollo-cache-persist'
import { HttpLink } from 'apollo-link-http'
import { ApolloLink, split } from 'apollo-link'
import { onError } from 'apollo-link-error'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import fetch from 'node-fetch'

// ! Environment Variables' source madness
// SERVER & SSR come from package.json; they are environment-agnostic
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

// in a local environment (only), each of the 3 web servers (CRA's HMR, server with ssr, server with no ssr) is assigned its own different port number.
// That enables running locally a CRA server alongside a production-like server w/o having to kill processes with identical ports.
// Graphql endpoints have to be assigned accordingly as well, to have each web client talk with its own separate graphql server.
// Each of the 3 servers has its own script line in package.json that prefixes the 'build' command with the proper variables/arguments
// The value of these variables are thus embedded by the build and are available thru process.env.
// All this is not possiblenor required in heroku.
//
// Heroku doesn't like the graphql port number to be specified as much as it doesn't with web servers
// port number assignment is therefore restricted to dev mode

const ApolloProviderClient = ({ children }) => {
  const [client, setClient] = useState(undefined)

  useEffect(() => {
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

    let graphqlEndpoint

    if (JSON.parse(REACT_APP_GRAPHQL_PORT_REQUIRED)) {
      const port = JSON.parse(REACT_APP_SERVER)
        ? JSON.parse(REACT_APP_SSR)
          ? REACT_APP_SERVER_SSR_GRAPHQL_PORT
          : REACT_APP_SERVER_NOSSR_GRAPHQL_PORT
        : REACT_APP_NOSERVER_NOSSR_GRAPHQL_PORT

      graphqlEndpoint = `${REACT_APP_GRAPHQL_DOMAIN}:${port}/graphql`
    } else {
      graphqlEndpoint = `${REACT_APP_GRAPHQL_DOMAIN}/graphql`
    }

    const httpEndpoint = `${REACT_APP_GRAPHQL_WEB_SCHEME}://${graphqlEndpoint}`
    const wsEndpoint = `${REACT_APP_GRAPHQL_WEBSOCKET_SCHEME}://${graphqlEndpoint}`

    const httpLink = new HttpLink({
      uri: httpEndpoint,
      fetch: fetch,
    })

    // ! errorLink
    // errorLink is the only way to identify errors coming from the server
    // particularly when the query is wrongly structured or the data makes it fail (both yielding status 400)
    //
    // errorLink may be used for authentication re-tries or error ignoring but here it only catches & logs what comes from the server
    // error handling is done in the query response (QueryResponse, that some day may be replaced by the useQuery hook)
    const errorLink = onError(
      ({ operation, response, graphQLErrors, networkError }) => {
        console.log('=== errorLink ===')
        console.log('operation: ', operation)
        console.log('response: ', response)
        console.log('networkError: ', networkError)
        console.log('graphQLErrors: ', graphQLErrors)
        console.log(
          'query: ',
          (((operation.query || {}).loc || {}).source || {}).body || {} // Nice hack to safely access deeply nested obj keys
        )
        console.log('===   ===')
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

    // See above for additional options, including other storage providers.
    persistCache({
      cache,
      storage: window.localStorage,
    }).then(() => {
      const initData = {}
      client.writeData({
        data: initData,
      })
      client.onResetStore(async () => cache.writeData({ data: initData }))
      setClient(client)
    })
    return () => {}
  }, [])

  //! Quick loader
  // When the time window for the loader/spinner is a fraction of a second,
  // my attempt to include a component, any component (e.g., <Loader />) resulted in an empty screen.
  // Probable reason: there's an overhead to mount a component
  // Aparently, by the time React mounted the Loader component, the data has arrived and so the user saw an empty screen
  // Animated svg had a similar fate - not showing anything.
  // That's why instead of mounting a component and or animating I'm showing an inline text.
  // Ugly. But as soon as Apollo integrates with React's Suspense I would anyway rewrite this.
  if (client === undefined)
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <div>Loading.......</div>
      </div>
    )
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

export default ApolloProviderClient
