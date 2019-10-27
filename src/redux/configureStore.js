import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import rootReducer from './reducers/index'
import thunk from 'redux-thunk'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web and AsyncStorage for react-native

// import logger from 'redux-logger'

// ! Persistence and Dehydration
// Refreshing '/merchants' page only to get back to the '/select' page and see it blank after all the keying is a very poor UX.
// Even more so if the page refresh happenned w/o the user's intention, by accidentally pulling the page, which will make it refresh.
// Not remembering user's credentials or past choices is not the least frustrating,
// especially when it comes to A2HS, which makes user expect his preferences would be kept.
//
// * redux - separate non-persisted items to their own separate keys
// Note, though:
// - redux-persist will black- or white-list only an entire store key, so store should be designed accordingly (there are nested persists but complicated)
// - no conditionals are allowed
//
//   Examples why conditionals may be needed:
//   When a user refreshes after populating just a *part* of the /select page, he probably does it to clear the page.
//   On the other hand, if that same user refreshes a /merchants page,
//   he would now expect everything he populated on the /select page to be kept,
//   rather than to be redirected back to a blank /select page.
//
//   Conditionals could be tackled by using redux-persist's migrations mechanism.
//   Another way would be to let redux-persist hydrate everything, then clear some of it (like in the 1st page case above).
//   This way or the other I'm currently not messing with it - persisting everything.
//
// * useEffects - resintate state based upon redux dehydrated values
//  Store dehydration is some times not enough:
//  In my case, if merchant card was persisted as 'open', then Merchant's useEffect should be triggered to expand the card
//  reinstating the UI state to what it used to be by the time the app was last used.
//  This is of course not the React way of doing things.
//  Ideally, an 'open' card state should reflect on its UI state with some declarative (css) definition.
//  In which case, rehydration would be enough.
//  In my case, since the card is a member of a list which is windowed and implemented with hard-coded values furnished by react-window,
//  it's not practical to make the UI state of any card declarative hence to persist it.
//
const persistConfig = {
  key: 'root',
  storage,
}

// ! Conditionally adding keys to an object
// Left to remember how to do it
// note the JSON.parse (turning the string "false" into false) and the "!" on the JSON.parse rather than the variable itself!
//
// const local = !JSON.parse(process.env.REACT_APP_SERVER)
// const persistConfig = {
//   key: 'root',
//   storage,
//   ...(local && { blacklist: ['app'] }),
//   ...(!local && { whitelist: ['lists'] }),
// }

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
