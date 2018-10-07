import { createStore, combineReducers, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'

import ReduxThunk from 'redux-thunk'

import { appReducer } from './reducers'

// add extra middlewares here
const createStoreWithMiddleware = composeWithDevTools(
  applyMiddleware(ReduxThunk)
)(createStore)

const rootReducer = combineReducers({
  app: appReducer,
})

export default function configureStore(initialState = {}) {
  return createStoreWithMiddleware(rootReducer, initialState)
}
