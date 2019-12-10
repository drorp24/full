import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from '../../src/App'
import Loadable from 'react-loadable'
import manifest from '../../build/asset-manifest.json'

import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import { ServerStyleSheets } from '@material-ui/core/styles'

console.log('entering app/server/middleware/renderer.js')

const path = require('path')
const fs = require('fs')

// ! Code Split with ssr
// Webpack recognizes both its own dynamic import()'s and React.lazy's
// so when build is run, it creates several separate .js chunks accordingly.
//
// That happens at build time, of course irrespective of which runtime library we'll be using to split the chunks in the returned response
//
// React.lazy should eventually have something in the server to identify which of the webpack-split
// JS and CSS chunks to send within that server-rendered index.html file, but it still doesn't have that capability.
//
// Until React.lazy is able to identify which js chunks and css styles pertain to the current request, I'm using
// - react-loadable - to identify the minimal set of js chunks required for the requested page
// - MUI's sheets - to collect and include the only css styles required for the current request
// - StaticRouter's context - to return an indication if <Redirect /> was encountered during the renderToString,
//   in which case no index.html should be returned at all but a 301 redirect code instead.
//
// All 3 use the regular technique to let children pass values to parent:
// define a variable at the parent, let the children modify it (during the renderToString)
// then collect the result back at the parent and return the response accordingly.
//
// * Not all splits are wise
// I ended up deciding that while splitting the css is important, splitting the JS in my case is a bad idea.
//
// CSS splitting is crucial for ssr, as it takes a lot of space and time to generate:
// Even for the very minimilistic first page I've created ('Welcome'), there are a few dozens MUI classes
// and then a number of my own.
// I could hard-code/inline the styles, but that would save almost nothing and it is super important for me
// to be using the MUI theme colors, fonts etc rather define things on my own.
//
// JS splitting on the other hand was a bad idea, because the difference in time b/w loading the entire JS
// bundle to the chunks required for only the first page is nominal; The time it takes the user to stare at
// the first static page before hitting the button is more than enough to load the entire bundle.
// The gain loading the entire bundle is that by clicking the button, the next page loads instantly.
// If the whole point of ssr is the first load, the second page should also load quickly.
// Esp. in my case, that the second page is quite complex.
//
// Thus, the combination of ssr'ing a simple static page plus not splitting the JS is that
// both the first, simple page as well as second, complex page load extremely fast.
//
// The first static page rendered by the server doesn't even require hydration:
// if user clicked the button even before React had the opprotunity to hydrate (he wouldn't)
// browser would just call the server for the next page, which would come partly server-rendered
// and be completly rendered by React as soon as it's ready.
// This means that the server-rendered page is ready for user interaction as soon as loaded even before hydration.
//
// As for the redirections: while it makes sense in the client, in ssr it just emulates the
// unefficient way it used to be done with servers (having the server instruct the browser to call it one more time)
// so unless required I see no benefit in it when ssr is in place.
//
// ! The real performance gains are done during the buile, not runtime
// Using 'analyze' I was able to cut away 90% of the JS bundle size, as it turned out to include huge stuff I didn't use.
// That step is far more important in my mind than runtime code split.
//
// As far as production go I think index.html has to be created once during build time
// rather than being server-rendered again and again with every request at runtime.

export default ({ store, persistor }) => (req, res, next) => {
  // point to the html file created by CRA's build tool
  const filePath = path.resolve(__dirname, '..', '..', 'build', 'index.html')

  fs.readFile(filePath, 'utf8', (err, htmlData) => {
    if (err) {
      console.error('err', err)
      return res.status(404).end()
    }

    const context = {}
    const modules = []

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

    const extractAssets = (manifest, modules) => {
      return Object.keys(manifest)
        .filter(asset => modules.indexOf(asset.replace('.js', '')) > -1)
        .map(k => manifest[k])
    }

    const extraChunks = extractAssets(manifest, modules).map(
      c => `<script type="text/javascript" src="${c}"></script>`
    )

    // return either a 301 redirect response, or
    // a populated index.html file with the manifest, iOs icons, service worker etc plus:
    // - <styles> required to style the *initial*, server-rendered markup,
    // - <link> tags with (only) the css chunks required for rendering/hydrating that requested page on the client
    // - <script> tags with (only) the js chunks required for rendering/hydrating that requested page on the client
    // - <script> tag with a serialized initialized redux state that may potentially include some server contribution in it

    if (context.url) {
      return res.redirect(301, context.url)
    } else {
      return res.send(
        htmlData
          .replace(
            '<style id="jss-server-side"></style>',
            `<style id="jss-server-side">${css}</style>`
          )
          .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
          .replace('</body>', extraChunks.join('') + '</body>')
          .replace('"__SERVER_REDUX_STATE__"', reduxState)
      )
    }
  })
}
