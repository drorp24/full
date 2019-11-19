// ! BrowserContext was deserted (see index.js) and left here for this note only
// * Why I didn't find another place to put this note
// This note is about setting (a context's) state when it is an object, and we need to set only one single key each time.
// This situation may suggest using several different states instead, if there isn't any benefit of holding them together.
// Indeed that's what I did in all other cases which is why I couldn't find an example.
//
// * Always return a new object
// Just like with redux state and component state, a context state update must yield a *new* state object
// or else components and useEffects that depend on (= subscribe to) its value changes won't notice the changes and react accordingly.
// And when only one out of multiple keys gets updated, this means that the current state value (before change) needs to be known.
//
// * Never use the current state *variable* if next state depends on the current one
// If we could some times get away with using the current state variable itself, in useEffects this will simply not work.
// That's because the current state will have to be declared as dependency of that useEffect, and then the setState will change it,
// causing that useEffect to be called again - for eternity.
//
// * Use the setSomething's functional form or better yet useReducer
// When next state depends / is derived from the current one, either use the functional form of the setSomething function returned by 'useState',
// or better yet use the dispatch function returned by calling 'useReducer' when it is fed with a reducer function
// that expects the current state and action and returns the next state - just like a redux reducer function does.
// It entails defining such a reducer function whose arguments are the current state and action and placing there all updating actions,
// but then the 'dispatch' function can be called with 'type' and 'payload' only, without having to know the updating logic.
// That 'dispatch' function returned by useReducer can be passed around to children and is not required to be indicated in useEffects.
//
// * useImmer / useImmerReducer when the updates are deep in the state object
// Regardless of the way described above to obtain the current state value, if the update requires more than {...state, ...payload}
// then some immutable library should be used. I'm using Immer.
// useImmer and useImmerReducer replace the useState and useRedcuer respectively, saving the need to wrap the reducer with 'produce'.
//
// https://medium.com/javascript-in-plain-english/react-context-patterns-with-usecontext-hook-62085b90c7eb
// https://github.com/immerjs/use-immer
//
import React, { useState, useEffect } from 'react'

import { ios, standalone, online } from './detect'

import Snackbar from '../page/Snackbar'

export const BrowserContext = React.createContext()

export const BrowserContextProvider = ({ children }) => {
  const [browserContext, setBrowserContext] = useState({})

  window.addEventListener('online', e => {
    console.log('BrowserContext load event')
  })

  useEffect(() => {
    setBrowserContext(browserContext => ({
      ...browserContext,
      ios: ios(),
      standalone: standalone(),
      online: online(),
      nativeInstall: null,
    }))

    window.addEventListener('beforeinstallprompt', e => {
      // This event is fired by Chrome adroid and desktop to signal that app is qualified to be installed ('add to home screen / A2HS')
      // The event is captured in the browserContext to be fired whenever the app wants to.
      // The app can then use the chrome's native prompt (e.prompt()) if it wants to.
      setBrowserContext(browserContext => ({
        ...browserContext,
        nativeInstall: e,
      }))
    })

    window.addEventListener('online', e => {
      console.log('Online. e: ', e)
      setBrowserContext(browserContext => ({ ...browserContext, online: true }))
    })

    window.addEventListener('offline', e => {
      console.log('Offline. e: ', e)
      setBrowserContext(browserContext => ({
        ...browserContext,
        online: false,
      }))
    })
  }, [])

  return (
    <BrowserContext.Provider value={browserContext}>
      {children}
      <Snackbar />
    </BrowserContext.Provider>
  )
}

// comment
