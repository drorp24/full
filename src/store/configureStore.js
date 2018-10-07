import { createStore, combineReducers, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'

import ReduxThunk from 'redux-thunk'

import { appReducer } from './reducers'

// the 'createStoreWithMiddleware' has the 'createStore' signature with its 2 arguments: rootReducer & initialState
const createStoreWithMiddleware = composeWithDevTools(
  applyMiddleware(ReduxThunk) // add extra middlewares here
)(createStore)

const rootReducer = combineReducers({
  app: appReducer,
})

export default function configureStore(initialState = {}) {
  return createStoreWithMiddleware(rootReducer, initialState)
}
