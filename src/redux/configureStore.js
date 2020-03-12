import { createStore, applyMiddleware } from 'redux'

import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web and AsyncStorage for react-native

import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

import rootReducer from './reducers/index'

// import logger from 'redux-logger'

// ! redux-persist works in spite of <PersistGate /> being commented
// Not sure why (maybe because 'store' includes 'persistedReducer'), but
// by looking at DovTools, it is absolutely evident that the following take place:
// -  'presist/REHYDRATE' action is dispatched
// -   it definitely populates all values into the up-to-that-point empty selector of the redux store
// This occurs every page load, including when offline.
// This is great news, as I commented PersistGate for the problems it created and not out of free will
//
// Some time after 'presist/REHYDRATE' is dispatched, my useEffect gets to work and calls the APIs,
// (which are fetched from the browser's disk cache when offline, not creating any issue, for some further confusion)
// but that's irrelevant to the fact that persist/REHYDRATE dispatched an action and reinstated all values from the cache
// long before the API had a chance to call the API again.
//
// It was also a bug, as APIs are supposed to be called *only* if 'populated' is false, for performance reasons.
// The bug was that the 'populated' key resided in 'app' selector, which was included in persistConfig's 'blacklist' key
// hence wrongly appeared to be false, making the API to be called blanking the coins list
// and the form initialization to take place, blanking the form as well.
// That API re-invocation was not only unnecessary, but it made the form values reset themselves and the coins list to become blank.
// Once the 'blacklist' key was gone, form wasn't reset and API weren't called, since 'populated' was correctly rehydrated to 'true'.
//
// Once 'blacklist' key was removed from persistConfig, form values and both lists are rehydrated from cache when page is reloaded,
// and the user sees the form values intact when page is reloaded with both dropdown lists populated as well
// - even when offline, which is impressive.
//
// That bug was another proof that redux-persist is active in spite of the <PersistGate /> commenting,
// since it was persistConfig's 'blacklist' key that made the form and list blank, which stopped getting blanked as soon as 'blacklist' was removed.
//
// Conclusions:
// - redux-persist is mandatory to not have page reloads blank the page,
// - redux-persist is particularly mandatory to support offline mode, which is mandatory for calling the app a PWA
// - apparently it can work with no <PersistGate /> (I will eventually find what the problem was)
// - persisting redux means that every population must first check if values exist already before potentially overriding good values
// - again, this otherwise performance thing, becomes crucial to support offline, as this could mean blanking values out
// - for the above purpose, it doesn't matter if the values themselves are checked or a 'populated' value is used, but if the latter,
//   it better not be in a blacklisted key of persistConfig's.
// - And generally persistConfig better not have a 'blacklist' key at all.

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

// ! Do not use blacklist
// Explained above
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
