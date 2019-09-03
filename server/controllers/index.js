import express from 'express'
import { setMessage } from '../../src/redux/actions'

import serverRenderer from '../middleware/renderer'
import configureStore from '../../src/redux/configureStore'

const router = express.Router()
const path = require('path')

const actionIndex = (req, res, next) => {
  const { store } = configureStore()
  store.dispatch(setMessage('Server'))

  serverRenderer(store)(req, res, next)
}

// root (/) should always serve our server rendered page
router.use('^/$', actionIndex)

// other static resources should just be served as they are
router.use(
  express.static(path.resolve(__dirname, '..', '..', 'build'), {
    maxAge: '30d',
  })
)

// 3rd rule, ignored by Duca
// anything else should act as our index page
// react-router will take care of everything
// NOTE: router.use did *not* pass the correct req.url into serverRenderer! Neither did app.use!
// That's why it has been changed to router.get
router.get('*', actionIndex)

export default router
