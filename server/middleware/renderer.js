import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from '../../src/App'
import Loadable from 'react-loadable'
import manifest from '../../build/asset-manifest.json'
import { Provider as ReduxProvider } from 'react-redux'

const path = require('path')
const fs = require('fs')

export default store => (req, res, next) => {
  // point to the html file created by CRA's build tool
  const filePath = path.resolve(__dirname, '..', '..', 'build', 'index.html')

  fs.readFile(filePath, 'utf8', (err, htmlData) => {
    if (err) {
      console.error('err', err)
      return res.status(404).end()
    }

    const context = {}
    const modules = []

    const jsx = (
      <ReduxProvider store={store}>
        <Loadable.Capture report={m => modules.push(m)}>
          <StaticRouter context={context} location={req.url}>
            <App />
          </StaticRouter>
        </Loadable.Capture>
      </ReduxProvider>
    )
    const html = ReactDOMServer.renderToString(jsx)
    const reduxState = JSON.stringify(store.getState())

    const extractAssets = (assets, chunks) =>
      Object.keys(assets)
        .filter(asset => chunks.indexOf(asset.replace('.js', '')) > -1)
        .map(k => assets[k])

    const extraChunks = extractAssets(manifest, modules).map(
      c => `<script type="text/javascript" src="/${c}"></script>`
    )

    // inject the rendered app into our html and send it
    return res.send(
      htmlData
        .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
        .replace('</body>', extraChunks.join('') + '</body>')
        .replace('"__SERVER_REDUX_STATE__"', reduxState)
    )
  })
}
