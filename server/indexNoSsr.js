const express = require('express')
const path = require('path')

const app = express()

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

console.log('indexNoSsr.js:')
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

const port = JSON.parse(REACT_APP_SERVER)
  ? JSON.parse(REACT_APP_SSR)
    ? REACT_APP_SERVER_SSR_WEB_PORT
    : REACT_APP_SERVER_NOSSR_WEB_PORT
  : REACT_APP_NOSERVER_NOSSR_WEB_PORT

console.log('web server non-ssr port: ', port)

app.use(express.static(path.join(__dirname, '..', 'build')))

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'))
})

app.listen(port, error => {
  if (error) {
    return console.log('something bad happened', error)
  }

  console.log('listening on ' + port + '...')
})
