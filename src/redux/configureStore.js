import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import rootReducer from './reducers/index'
import thunk from 'redux-thunk'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web and AsyncStorage for react-native

// import logger from 'redux-logger'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['lists'],
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
