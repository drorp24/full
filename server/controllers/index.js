import express from 'express'
import path from 'path'

import configureStore from '../../src/redux/configureStore'
import { setMessage } from '../../src/redux/actions'

import serverRenderer from '../middleware/renderer'

console.log('entering app/server/controllers/index.js')

const app = express()

// Instruct browser to not cache service-worker.
//
// This will make it fetch from the server a new release (= represented by a newer, waiting sw)
// as soon as it is ready (or at least, next time user reloads or enters app)
// which enables to inform the user of the new release and let him upgrade if desired.
// app.get('/service-worker.js', (req, res, next) => {
//   res.setHeader(
//     'Cache-Control',
//     'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
//   )
//   next()
// })

// Serve files from the build folder for every static file request
app.use(
  express.static(path.resolve(__dirname, '..', '..', 'build'), {
    maxAge: 0,
  })
)

// Serve the built/ssr'd index.html for all other requests from our domain
app.use('*', (req, res, next) => {
  // An example of how the server can create some redux value of its own and send it to client
  // Other redux values are initiated by the client using redux-persist
  const { store } = configureStore()
  store.dispatch(setMessage('Server'))

  serverRenderer(store)(req, res, next)
})

// Either 'app' or 'router' can be use'd
export default app
