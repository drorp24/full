import express from 'express'
import Loadable from 'react-loadable'
import indexController from './controllers/index'

// initialize the application and create the routes
const app = express()

app.use(indexController)

// in a local environment (only), each of the 3 web servers (CRA's HMR, server with ssr, server with no ssr) is assigned its own different port number.
// That enables running locally a CRA server alongside a production-like server w/o having to kill processes with identical ports.
// Graphql endpoints have to be assigned accordingly as well, to have each web client talk with its own separate graphql server.
// Each of the 3 servers has its own script line in package.json that prefixes the 'build' command with the proper variables/arguments
// The value of these variables are thus embedded by the build and are available thru process.env.
// All this is not possible nor required in heroku, whose web port numbers are determined at run time and available as process.env.PORT.
//
// SERVER & SSR come from package.json; they serve as command modifiers/arguments (irrespective of environment).
// The others come from multiple .env files; they are environment-specific configuration.
// CRA build enables using multiple files to enable local overrides (not supported by dotenv):
// When run locally, DOMAIN for instance comes from .env.production.local while the others come from .env.production.
const {
  REACT_APP_SERVER,
  REACT_APP_SSR,
  REACT_APP_DOMAIN,
  REACT_APP_ENV_FILE,
  REACT_APP_NOSERVER_NOSSR_WEB_PORT,
  REACT_APP_SERVER_SSR_WEB_PORT,
  REACT_APP_SERVER_NOSSR_WEB_PORT,
} = process.env

console.log('index.js (ssr):')
console.log(
  'REACT_APP_SERVER, REACT_APP_SSR, REACT_APP_DOMAIN, REACT_APP_ENV_FILE, REACT_APP_NOSERVER_NOSSR_WEB_PORT, REACT_APP_SERVER_SSR_WEB_PORT, REACT_APP_SERVER_NOSSR_WEB_PORT: ',
  REACT_APP_SERVER,
  REACT_APP_SSR,
  REACT_APP_DOMAIN,
  REACT_APP_ENV_FILE,
  REACT_APP_NOSERVER_NOSSR_WEB_PORT,
  REACT_APP_SERVER_SSR_WEB_PORT,
  REACT_APP_SERVER_NOSSR_WEB_PORT
)

// heroku doesnt allow port number to be assigned, providing a dynamic environment variable instead ($PORT)
const port =
  process.env.PORT ||
  (JSON.parse(REACT_APP_SERVER)
    ? JSON.parse(REACT_APP_SSR)
      ? REACT_APP_SERVER_SSR_WEB_PORT
      : REACT_APP_SERVER_NOSSR_WEB_PORT
    : REACT_APP_NOSERVER_NOSSR_WEB_PORT)

console.log('web server ssr port: ', port)

// start the app
Loadable.preloadAll().then(() => {
  app.listen(port, error => {
    if (error) {
      return console.log('something bad happened', error)
    }

    console.log('listening on ' + port + '...')
  })
})
