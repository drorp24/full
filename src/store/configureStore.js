import { createStore, combineReducers, compose, applyMiddleware } from 'redux'

import ReduxThunk from 'redux-thunk'

import { appReducer } from './reducers'

// add extra middlewares here
const createStoreWithMiddleware = compose(applyMiddleware(ReduxThunk))(
  createStore
)

const rootReducer = combineReducers({
  app: appReducer,
})

export default function configureStore(initialState = {}) {
  return createStoreWithMiddleware(rootReducer, initialState)
}
