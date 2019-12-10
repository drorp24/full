import './index.css'
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'

import App from './App'
import registerServiceWorker from './registerServiceWorker'
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

const root = document.getElementById('root')
window.onload = () => {
  const renderMethod = ssr ? ReactDOM.hydrate : ReactDOM.render
  Loadable.preloadReady().then(() => {
    // alert('click to hydrate') // A way to catch what the server rendered and then what hydrate did with the ssr'd page
    renderMethod(AppBundle, root)
  })
}

// ! Use Redux not React.Context when there is no component to hang to
// 'registerServiceWorker' must be run upon window.load, i.e., before any component is rendered
// (putting code inside a window.onload in any component's useEffect will do nothing: the onload event will be missed)
// if I need to write something in a place "everyone can see", there is no component to attach a hook such as useSelector or useContext.
// Redux to the rescue:
// Passing 'store' into registerServiceWorker enables it to access 'dispatch' with store.dispatch requiring no hook or old-fashioned connect.
//
// 'initiateDeviceProperties' even manages to dispatch a thunk.
registerServiceWorker(store)
initiateDeviceProperties(store)
