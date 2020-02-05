import express from 'express'
import path from 'path'
import compression from 'compression'

import configureStore from '../../src/redux/configureStore'
import { setMessage } from '../../src/redux/actions'

import serverRenderer from '../middleware/renderer'

const app = express()

// ! ssr vs. pre-rendering
// This code will not only be accessed upon entry to the app ('/') but for every page reload as well.
// However, if a user reloads a page in an SPA, he should get the page from a service-worker cache and/or
// the browser's cache, not the server.
//
// If that's not enough:
// Pages other than the first are more liable to have a dynamic markup (like my form),
// which means they can only be client-rendered.
// Such pages will have a 'ssr road block' like the one I put in FormContainer,
// preventing the server from rendering most of the page.
//
// Even if the server returned an entire page markup, that markup would have to be hydrated by the client for the user
// to be able to interact with it.
//
// Whether fetched from a service-worker cache or the server, the client has to populate state.
// From my experience that takes time (so much time that I ended up giving up redux-persist
// but I may have placed too much data in the cache).
//
// This means that page reloads may take time, esp. if state is persisted and recovered;
// That's not too bad, since in a properly designed mobile-first app, refresh shouldn't be something
// the user will want to do anyway.
//
// That rarity only strengthens my point, that ssr is really for first-page performance only.
//
// And since first page should ideally be completely static, it could just as well be *pre-rendered* rather than
// server-rendered. It's silly to have each request to the server have to render the very same static page.
// In that respect, I see little point in ssr altogether.

// ! Caching every static request but the service-worker
// For most static files, maxAge should be as long as needed,
// so that the browser can fetch the file from its own cache or the service-worker's rather than calling the server to fetch it.
// This is safe too, as once a more updated file is built, its signed name is different.
//
// When it comes to service-worker.js, however, the opposite is true: neither the browser not the service-worker should cache this file
// (it's confusing to think that the sw process would cache the service-worker.js code file, but that's anyway not happenning).
// Since otherwise, the browser or the sw process would keep fetching the old cached version, with the old precached files.
//
// There would need to be a page reload for the browser to "notice" the new service-worker.
// According to documentation, with only one active tab controlled by a service-worker process,
// a page reload is all that's needed to fetch the new updated files, but I'm not sure this is the case.
// It appears that as long as the tab is open, the old sw will be active even after browser noticed the newer pending release.
//
// This way or the other, when browser becomes aware of the new waiting release, it does the following:
// - it fires an event
// - it places a 'waiting' key on the registration obj (which is a kind of the sw's "representative" on the window obj, i.e., the web process)
// both signalling that if desired, a SKIP_WAITING postMessage can be sent to the sw process,
// which would replace the files with the updated ones (after another page reload).
// I'm watching for these 2 events in serviceWorker.js to inform the user and act accorindgly.
//
// The new service-worker.js file is not signed (why is beyond me) but the browser somehow notices its content is different
// and does whatever is described above to draw attention to the new release.
//
// In CRA's Workbox implementation, the change in service-worker.js code is replacement of the precached-manifest list,
// that's found in the generatd service-worker.js code, with the updated one.
// The preached-manifest filename is also signed, so that file itself can be cached until a new one arrives.
// The precached-manifest file is the one used by the sw process to update its cache.
//
// * implementing it with cache headers
// All posts about service workers remind to set its max-age to zero lest the browser will cache an old one.
// Why not simply sign the the file name like all the rest of the static files is beyond me.
// And since that's not the way it's done, we now need to set a long (say '1y') cache-control header for all static files
// and at the same time set it to zero for the service-worker.js request.
//
// I did it here below.
// I could do it in a separate app.get for service-worker.js but I didn't find an example for this anywhere.
// The thing is there's not one single discussion or example of that in the entire cyberspace. Not one single post.
//
// ! express.static confusions
// * /public or /build?
// express.static doesn't know if a req.path is static or not; it just checks if a file with that name exists on the specified folder
// and if it does, serves the file as is from that folder.
//
// It is therefore confusing that 2 static files express.static handles, favicon.ico and manifest.json, are actually in the /public folder
// and referred to as %PUBLIC%/... in the index.html link tags, but ended up being handled by express.static, which clearly doesn't see beyond
// the /build folder and clearly handled them both.
//
// It turns out that the build process copies them both into the /build folder during its build
// so express.static finds them there and actually serves them from there.
//
// The CRA instruction to place the files in the /public folder and refer both link tags to %PUBLIC% only to copy them to /build, *uncahnged*,
// is odd and confusing.
// Maybe they expect these files to be generated at some point in the future, or just don't want developers to mess with the /build folder.
//
// * serve favicon every page reload?
// Another confusing thing was that favicon.ico is called from the server with *each and every* page reload, together with service-worker.js.
// But while service-worker.js has zero max-age and needs to be called from the server with every page reload, favicon.ico has a '1y' max-age
// like most other express.static served files and is the last file we would imagine having to be called from the server every page reload.
//
// Turns out that Chrome browser has a bug, that was supposed to be fixed but aparently wasn't.
// So every page reload initiated by Chrome calls favicon.ico from the server, together with service-worker.js.
// Doesn't happen with Firefox or Safari.
//

// ! app.use vs. app.get
// If http verb nor the path matter, app.use should be used. app.use(compression()) is a good example.
// The confusing part with app.use is that its optional 1st arg is *different* than app.get's mandatory 1st arg which is the path
// so while app.get('*', function(...)) stands for "all paths", app.use('*', function(...)) means something else (but very similar).
// Using app.use('*', function(req)) will pass an *incorrect* req ('/' instead of '/welcome' for instance)
// unlike app.use(function(req)), which would pass the correct req.

// ! Letting the server initiate values in redux store
// Generally, including data in the server-rendered html is not a good idea.
// But some times, it may be beneficial for the server to initiate some values to the client (value from DB perhaps)
// The way for the server to do that is to hop on the redux store, which would be passed inside a <script> tag.
// This is anyway for data, never for state (server should never be stateful)
// State is only maintained by the client, and if needs to be persistent, is persisted by the client (with the help of redux-persist).
//
// The following is merely an excercise in passing some data from server to client.
// I'm using here the same trick I've used on the client when I'm not yet exposed to 'dispatch': store.dispatch
const { store, persistor } = configureStore()
store.dispatch(setMessage('Server'))

// compress any response
app.use(compression())

const logRequest = function(req, res, next) {
  console.log('req.url: ', req.url)
  next()
}

// log any response
app.use(logRequest)

// respond with the file from the /build folder
// populating cache header with '1y' for all but service-worker.js
app.use(
  express.static(path.join(__dirname, '..', '..', 'build'), {
    maxAge: '1y',
    setHeaders: function(res, path) {
      // console.log('path: ', path)
      if (path.includes('service-worker')) {
        res.setHeader('Cache-Control', 'max-age=0')
      }
    },
  })
)

// I'm not sure if there's an implicit 'return' preventing previously fulfilled req from arriving here
// or that only the dynamic requests are of the '/*' form, but it works and I've given up on the express docs.
// Following code handles every request that requires a dynamic, server-rendered page to be sent out
app.get('/*', (req, res, next) => {
  console.log('')
  console.log(
    `res for ${req.url} will be index.html with the server-rendered requested page`
  )
  console.log('')

  serverRenderer({ store, persistor })(req, res, next)
})

export default app
