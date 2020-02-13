import './index.css'
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import {
  detectSwWaiting,
  InformSwWaiting,
  informContentCached,
} from './redux/reducers/device'

import App from './App'
import * as serviceWorker from './serviceWorker'
import Loadable from 'react-loadable'

import { Provider as ReduxProvider } from 'react-redux'
import configureStore from './redux/configureStore'
// import { PersistGate } from 'redux-persist/integration/react'

import { initiateDeviceProperties } from './components/utility/deviceProperties'

const ssr = JSON.parse(process.env.REACT_APP_SSR)

const storeConfig = configureStore(ssr ? window.REDUX_STATE || {} : {})
const { store /* , persistor */ } = storeConfig

// ! redux-persist doesn't work with ssr
// https://github.com/rt2zz/redux-persist/issues/1008
// https://github.com/rt2zz/redux-persist/issues/1053
// When PersistGate is on, the page, that rendered instantly thanks to ssr, is erased as soon as React/main.js load,
// then flickers the react-rendered page for a fraction of a second then makes a request to the server again, then
// a white screen of death for a good 5-8 seconds, and only then the page appears.
//
// Replacing the declarative persistor with imperative code like persistor.subscribe(() => ...) took
// the same amount of time, making me think this long time was used to await for the persistor to synchronize
// with the persistance.
// This may explain why the browser appeared to do nothing at all during that time (devtools).
// Maybe the reason it took that much time is that I put the currency and coin lists there.
//
// * reudx-persist is not really required anyway
//
// When I started this, backing from the /merchants page to the /select page cleared out the values just filled by the user
// That was the original purpose of the redux-persist
// Somehow, Chrome browser now auto-populates the values back even with no redux-persist, so I'm ok.
// TODO: Check Safari mobile browser does that too.
//
// ! Providers should be placed as lower in the tree as possible
// There are providers like ErrorBoundary, which can safely be placed on top of the overall app tree and that's fine.
// Others however can spoil things if placed higher in the tree than needed.
//
// A provider (such as PersistGate mentioned above), though defined declaratively as a wrapper tag,
// actually is a code that runs when the tree that includes it is rendered.
// That code typically does some initiation work. That work may take time and block rendering.
//
// In the above example, PersistGate was responsible for the 5-8 seconds delay in rendering.
// When I tried replacing it with 'persistor.subscribe' as recommended by several posts, persistor.subscribe
// took that amount of time as well; because it's has essentially run the same initiation code.
// That provider was waiting forever for something to happen, blocking the io and creating that white screen of death,
// But even a relatively short provider like ApolloProvider, that I previously
// held here in the App tree was causing problems, inspite of running very quickly.
// The amount of time it took ApolloProvider to run its code, albeit small, made it block the the UI,
// which was already rendered by the server, making the server-rendered disappear leaving a white blank page
// for a fraction of second before it was rendered again, this time by React.
// The reason: React started rendering it, and that white time was the time it took the ApolloProvider to decide what to do.
// During the time ApolloProvider ran its initiation code, io was blocked.
// The fact that the page has been already server-rendered and showing actually made things worse than
// had it not been server-rendered. That's because the app's background color turns white and then rendered again
// That created a blue-white-blue flicker.
// As soon as I removed the ApolloProvider from the AppBundle tree, that flicker stopped.
// ApolloProvider was moved to the Select component, which is the first component that actually needs it.

// Wrap <App /> here with browser-specific components only
//(put server-specific ones in server/middleware/renderer)
// Common stuff (e.g., theme) should be included in <App />
const AppBundle = (
  <ReduxProvider store={store}>
    {/* <PersistGate loading={null} persistor={persistor}> */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
    {/* </PersistGate> */}
  </ReduxProvider>
)

// ! Order is important
// serviceWorker.register should be defined after window.onload is defined
// and initiateDeviceProperties should await and be defined within onload or else its values would be overriden by reudx-persist's hydrate

const root = document.getElementById('root')
window.onload = () => {
  const renderMethod = ssr ? ReactDOM.hydrate : ReactDOM.render
  Loadable.preloadReady().then(() => {
    renderMethod(AppBundle, root)
    initiateDeviceProperties(store)
  })
}

// ! passing 'store' enables accessing 'dispatch'
// follows from the above is that serviceWorker.js code is run before 'onload', let alone any component is rendered.
// This means it can't get access to redux' dispatch neither thru the old way ('connect' HOC) nor thru useDispatch hook.
// Since it is required to dispatch, the way to make it access dispatch is to pass 'store' into it.
// That's a solution for any case (albeit rare) that a non-component code needs to dispatch something to redux.
serviceWorker.register({
  onPageLoad: detectSwWaiting(store),
  onSwWaiting: InformSwWaiting(store),
  onContentCached: informContentCached(store),
})
