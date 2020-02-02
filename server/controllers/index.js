import express from 'express'
import path from 'path'
import compression from 'compression'

import configureStore from '../../src/redux/configureStore'
import { setMessage } from '../../src/redux/actions'

import serverRenderer from '../middleware/renderer'

const app = express()

// ! app.use vs. app.get
// Eternal confusion.
// If http verb nor the path matter, app.use should be used. app.use(compression()) is a good example.
// The confusing part with app.use is that its optional 1st arg is *different* than app.get's mandatory 1st arg which is the path
// so while app.get('*', function(...)) stands for "all paths", app.use('*', function(...)) means something else.
// Using app.use('*', function(req)) will pass an *incorrect* req ('/' instead of '/welcome' for instance)
// unlike app.use(function(req)), which would pass the correct req.

// ! 3 routes instead of 2
// CRA official solution (https://create-react-app.dev/docs/deployment/#serving-apps-with-client-side-routing) never worked for me.
// When I did exactly as prescribed, app entry ('/') wasn't caught by app.get('/*').
// Instead, it was caught by the app.use(express.static) line that preceeds app.get('/*').
// The only way that worked for me was to split the two ('/') from ('/*')
// - putting ('/') first so it is server-rendered rather than being caught by express' static handler,
// - then handle anything that is found in the build folder by express' static handler,
// - then server-rendering all the other requests ('*') that match neither criteria.
// Not sure if it's me or the documentation (which is bad anyway).

// compress any response
app.use(compression())

// ! Letting the server initiate values in redux store
// Generally, including data in the server-rendered html is not a good idea.
// But some times, it may be beneficial for the server to initiate some values to the client (value from DB perhaps)
// The way for the server to do that is to hop on the redux store, which would be passed inside a <script> tag.
// This is anyway for data, never for state (server should never be stateful)
// State is only maintained by the client, and if needs to be persistent, is persisted by the client (with the help of redux-persist).
//
// I'm using here the same trick I've used on the client when I'm not yet exposed to 'dispatch': store.dispatch
const { store, persistor } = configureStore()
store.dispatch(setMessage('Server'))

// ! ssr is really for first static page only
// This code will not only be accessed upon entry to the app ('/') but for every page reload as well
// However usually, pages other than the first are better client- than server-generated
// Such pages will typically have a 'ssr road block' like the one I put in FormContainer,
// prevernting the server from rendering the page or (as in my case) the complex part of it.
//
// Ssr is anyway meant to facilitate first load perception and not for reloads (which should rarely happen anyway).
// Even if reloads would be server-rendered, it would anyway take time to populate the current state in them,
// as the state is held by the client not the server, let alone the time it would take to hydrate, before which
// the page won't allow any interaction.
//
// I think Ssr should be kept only for first load perception and as such should handle only the first page,
// which has to be static and quick to render.
//
// * Pre-rendering
// If it's only for the first page and blocked for the other pages then I would go the full monty
// and pre-render the first page at build time.
// If only for the fist page then I don't see the point in ssr at all.

const logRequest = function(req, res, next) {
  console.log('req.url: ', req.url)
  next()
}

app.use(logRequest)

app.get('/', (req, res, next) => {
  console.log(`req.url: ${req.url} handled by app.get(/)`)
  console.log('')

  serverRenderer({ store, persistor })(req, res, next)
})

// TODO: remove eventually. Here only to guard against not finding start url ('./') in the cache
// TODO: a. I know it's not happenning and b. even with '/select' reload the sw does'nt work so it's not that.
// TODO: remove the 'index.html' route from App.js as well
app.get('/index.html', (req, res, next) => {
  console.log(`req.url: ${req.url} handled by app.get(/index.html)`)
  console.log('')

  serverRenderer({ store, persistor })(req, res, next)
})
// ! maxAge
// maxAge should, and can safely be long.
// As soon as there's a more updated file, its name would be different since the name is signed according to content.
// Entering the app would use the new updated file,
// but reloading or opening a new tab will use the old one in the current service-worker's manifest if there's another tab opened.
// But while the service-worker will send the current listed files in spite of the reload,
// it will notice the new release and create the 'waiting' key on the service-worker's registration obj.
// I'm checking every reload if there's a waiting key on the reg, and if there is,
// render a snackbar that lets the user install the new release if he wants to.
//
// * What does express.static actually do
// I didn't read the 'express.static in depth' post and the express documentation is lacking,
// but according to one answer in stack overflow, express.static doesn't know if a request is static or not;
// It just responds to a request if it sees its name in the specified ('build') folder.
app.use(
  express.static(path.join(__dirname, '..', '..', 'build'), {
    maxAge: '1y',
  })
)

app.get('*', (req, res, next) => {
  console.log('')
  console.log(`req.url: ${req.url} handled by app.get(*)`)

  serverRenderer({ store, persistor })(req, res, next)
})

export default app
//comment1
