import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from '../../src/App'
// import Loadable from 'react-loadable'
// import manifest from '../../build/asset-manifest.json'

import { Provider as ReduxProvider } from 'react-redux'
// import { PersistGate } from 'redux-persist/integration/react'

import { ServerStyleSheets } from '@material-ui/core/styles'

const path = require('path')
const fs = require('fs')

// ! Code Split with ssr
// TL;DR - not possible in CRA, since it requires configuring webpack and babel.
//
// * What's working
// - Webpack does split the bundles at build time, as per React.lazy's and import() statements.
// - react-scripts excludes all dynamically imported components from the index.html generated by the build process.
// - This works just as well on the server, as it merely takes the generated index.html (1)
// - Browser consequently only fetches the bundles needed for the route, and fetches the dynamically imported ones when needed.
// - In parallel, to confuse things, the sw process reads the precache-manifest.json, signs each file there
//   then fetches *the entire list* from the server. But that prefecthing doesn't come on expense of the main thread.
//   In the server log it looks like double fetching (which it probably is, see comments),
//   but the client's network tab clearly shows that only the required files were fetched.
//
//   (1) with react-loadable, there was an effort of identifying which modules participate in the route then deriving
//    the respective bundles to include. Maybe it's simpler nowadays.
//
// * What's not
//
//  - <Suspense /> is not recognized by the renderToString, but is required for React.lazy to work
//
// * What I tried
//
// - Tried wrapping <Select /> with <Suspend /> that would wrap <Select /> with <Suspense /> in client and wrap
//   it with nothing on the server.
// - Tried using webpack's import() directly and resolving the promise in a useEffect that sets the component.
//   didn't work either (see AppAttemps.js) maybe because I didn't wrap it in <Suspense />.
//
// If ever, I think I shouldnt attemp to re-implement react.lazy but focus on the server ignoring Suspense,
// since React.lazy works well on the client.
//
//
// ! Non-blocking CSS
// Using a CSS-in-JS tool like MUI inlines all styles in the <header /> tag, whether during run time
// or during the server rendering, so no CSS files to fetch for my own internal components.
//
// As for external CSS files, I have one, which bundles the 2 imports in 'MuiAutosuggest'.
// They contain a few CSS rules and mostly the embedded flags.
// Lighthouse claimed it delayed rendering by 0.6s which was quiet a lot.
// I solved this with preloading, as google advises in web.dev.
//
// I used that file for simplicity but it is generally not such a good idea to greedily include all flags, even if compressed,
// rather than lazily load only the necessary ones, like I do with the coins' 'png' files.
//
// ! Sometimes not splitting JS is better
// In many cases, the user first views a static page. That could be a good opportunity to fetch JS
// and save the time it would take to do it when the user enters the other page.
//
// Prefetching is generally the role of sw, which also has the advantage of not blocking the main thread.
// But that's not a perfect solution either, as sw only starts fetching once the main thread finished its own fetching,
// and it doesn't know which file will be required first (3).
//
// - if at all possible, server should code-split
//   I see no point in only client code-splitting. It's the first page that's important.
// - if not possible then not splitting the JS code might not be that bad as long as it doesn't delay interactivity (TTI) too much.
//
// (3) I still don't get it why sw fetches the files just fetched by the main thread.
//
// ! Optimizing bundle sizes
// Using 'analyze' I was able to cut 90% of the JS bundle size, as it turned out to include huge stuff I didn't use.
// That step is far more important in my mind than runtime code split.
//
// ! Prerendering
// As far as production go I think that index.html has to be created once during build time
// rather than being server-rendered again and again with every request at runtime.
// This is obvious in cases such as I had, that the file rendered over and over was *identical*,
// but also if it contained user details, which can be completed on the client side.
//
// ! sw's odd caching
// I don't get it why sw requests an 'index.html' rather than requesting for '/', and why it keeps only the first in its cache,
// which means
// - it keeps the *empty* index.html in its cache, throwing away the rendered '/' the main thread got
//   so *every time* a page would be fetched, it would have to call React to render it *again*
// - when user reloads browser, sw will use its precached index.html and will never reach the server, missing the server's
//   rendering.
// - Since index.html is empty before React fills it with markup, the page reload will also create some FOUC.
//
// I understand that precache-manifest.json always includes 'index.html', but that's no reason for sw to cache it:
// when server gets a req for 'index.html', it doesn't know that the route is, so the best it can do is to return the empty static index.html
// created during the build process.
//
// This joins my (3) point, which is the "lack of cooperation" b/w the main thread and the sw. If the sw
// - requested an actual path such as '/' or '/select' instead of 'index.html' and also
// - cache-keyed them by those routes
// then the problems above would be solved.
//
// I am almost positive that I'm missing something, but googling it didn't yield much.
//
// ! Changes in this code some times aren't noticed by the client (no cache busting)
// Not sure why, but this happens, In such cases I should manually bust the sw cache (and check why that happens).

export default ({ store, persistor }) => (req, res, next) => {
  // point to the html file created by CRA's build tool
  const filePath = path.resolve(__dirname, '..', '..', 'build', 'index.html')

  fs.readFile(filePath, 'utf8', (err, htmlData) => {
    if (err) {
      console.error('err', err)
      return res.status(404).end()
    }

    const context = {}
    // const modules = []

    // Wrap <App /> here with server-specific components only
    //(put browser-specific ones in src/index)
    // Common stuff (e.g., theme) should be included in <App />
    const jsx = (
      <ReduxProvider store={store}>
        {/* <Loadable.Capture report={m => modules.push(m)}> */}
        {/* <PersistGate loading={null} persistor={persistor}> */}
        <StaticRouter context={context} location={req.url}>
          <App />
        </StaticRouter>
        {/* </PersistGate> */}
        {/* </Loadable.Capture> */}
      </ReduxProvider>
    )

    const sheets = new ServerStyleSheets()
    const html = ReactDOMServer.renderToString(sheets.collect(jsx))
    const css = sheets.toString()
    const reduxState = JSON.stringify(store.getState())

    // const extractAssets = (manifest, modules) => {
    //   return Object.keys(manifest)
    //     .filter(asset => modules.indexOf(asset.replace('.js', '')) > -1)
    //     .map(k => manifest[k])
    // }

    // const extraChunks = extractAssets(manifest, modules).map(
    //   c => `<script type="text/javascript" src="${c}"></script>`
    // )

    // return either a 301 redirect response, or
    // a populated index.html file with the manifest, iOs icons, service worker etc plus:
    // - <styles> required to style the *initial*, server-rendered markup,
    // - <link> tags with (only) the css chunks required for rendering/hydrating that requested page on the client
    // - <script> tags with (only) the js chunks required for rendering/hydrating that requested page on the client
    // - <script> tag with a serialized initialized redux state that may potentially include some server contribution in it

    if (context.url) {
      return res.redirect(301, context.url)
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000')
      res.set('Content-Type', 'text/html')
      return res.send(
        htmlData
          .replace(
            '<style id="jss-server-side"></style>',
            `<style id="jss-server-side">${css}</style>`
          )
          .replace(
            /rel="stylesheet"/g,
            'rel="preload" as="style" onload="this.rel=\'stylesheet\'"'
            // 'rel="author"'
          )
          .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
          // .replace('</body>', extraChunks.join('') + '</body>')
          .replace('"__SERVER_REDUX_STATE__"', reduxState)
      )
    }
  })
}
