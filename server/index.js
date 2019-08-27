import express from 'express'
import Loadable from 'react-loadable'
import indexController from './controllers/index'

// initialize the application and create the routes
const app = express()

app.use(indexController)

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
  process.env.PORT || JSON.parse(REACT_APP_SERVER)
    ? JSON.parse(REACT_APP_SSR)
      ? REACT_APP_SERVER_SSR_WEB_PORT
      : REACT_APP_SERVER_NOSSR_WEB_PORT
    : REACT_APP_NOSERVER_NOSSR_WEB_PORT

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
