import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import rootReducer from './reducers/index'
import thunk from 'redux-thunk'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web and AsyncStorage for react-native

// import logger from 'redux-logger'

// ! Conditionally adding keys to an object
// in plain English: persist everything (only) when in local env / dev mode
// (incl. 'contextual', which will leave AppBar contextual when page is refreshed, until separated and excluded)
// note the JSON.parse (turning the string "false" into false) and the "!" on the JSON.parse rather than the variable itself!
const local = !JSON.parse(process.env.REACT_APP_SERVER)

const persistConfig = {
  key: 'root',
  storage,
  ...(local && { blacklist: ['app'] }),
  ...(!local && { whitelist: ['lists'] }),
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export default (initialState = {}) => {
  const store = createStore(
    persistedReducer,
    initialState,
    composeWithDevTools({ trace: true, traceLimit: 25 })(
      applyMiddleware(thunk /*, logger */)
    )
  )
  const persistor = persistStore(store)
  return { store, persistor }
}
