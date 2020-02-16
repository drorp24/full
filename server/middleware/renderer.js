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
// Webpack recognizes both its own dynamic import()'s and React.lazy's
// so when build is run, it creates several separate .js and .css chunks accordingly.
//
// * JS
// Identifying which JS code chunk belongs to which route requires identifying which component belongs to which route, detecting their chunks
// athennd including only those chunks as <link /> tags in the returned html file.
// I've originally used react-loadable for that, but react-loadable became obsolete so I commented it and returning all chunks.
// React now recommends another library, Loadable Components, but I'll just wait till React.lazy code splits on the server side too.
//
/// * CSS
// External
// I only have one  external CSS file (for the flags). I can't split it (it belongs to Select component) and
// since CSS is usually render-blocking, it is quite a problem, delaying the rendering by 0.6s according to Lightbox.
// What I did was to use "preload", as suggested by google/lightbox so AFAIU it doesn't block rendering.
// I suppose React.lazy will eventually cater for CSS splitting as well.
//
// Thankfully, MUI inlines all styles in the <header /> tag, so no CSS files to fetch, but it too doesn't split the CSS.
// MUI's sheets is used to collect and inline the styles into the 'css' variable which I embed below into the returned html.
//
// * Splitting Considerations
// Not all splits are wise.
// I ended up deciding that while splitting the css is important, splitting the JS in my case is a bad idea.
//
// CSS splitting is crucial for ssr, as it takes a lot of space and time to generate:
// Even for the very minimilistic first page I've created ('Welcome'), there are a few dozens MUI classes
// and then a number of my own.
// I could hard-code/inline the styles, but that would save almost nothing and it is super important for me
// to be using the MUI theme colors, fonts etc rather define things on my own.
//
// By *not* splitting JS, however, we utilize the time it takes the user to stare at
// the first static page before hitting the button to load the entire bundle.
// By the time user hits the button, the JS is supposedly fully loaded so next page loads instantly.
//
// Thus the combination of ssr'ing a simple static page *and* not splitting the JS is that
// both the first, simple page as well as second, complex page load extremely fast.
//
// The first static page rendered by the server doesn't even require hydration:
// if user clicks the button before React had a chance to upload React code
// then the browser would just call the server which will render the next page.
// This means that the server-rendered page is ready for user interaction as soon as loaded even before hydration.
//
// ! Code split is not great. The real performance gains are done during the build
// From my experience, both of the following *build-time* optimizations have a *far better* effect than code splitting:
//
// * Optimizing bundle sizes
// Using 'analyze' I was able to cut 90% of the JS bundle size, as it turned out to include huge stuff I didn't use.
// That step is far more important in my mind than runtime code split.
//
// * Prerendering
// As far as production go I think that index.html has to be created once during build time
// rather than being server-rendered again and again with every request at runtime.
// This is obvious in cases such as I had, that the file rendered over and over was *identical*,
// but also if it contained user details, which can be completed on the client side.

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
          )
          .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
          // .replace('</body>', extraChunks.join('') + '</body>')
          .replace('"__SERVER_REDUX_STATE__"', reduxState)
      )
    }
  })
}
