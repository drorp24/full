import React, { useState, useEffect } from 'react'
import { ios, standalone, online } from './detect'

export const BrowserContext = React.createContext()

export const BrowserContextProvider = ({ children }) => {
  const [browserContext, setBrowserContext] = useState({})

  console.log(
    'entering BrowserContextProvider. browserContext: ',
    browserContext
  )

  // ! Using functional form or useReducer when setting a state inside a useEffect
  // * Why using the state variable won't work
  // When a new state value, set in a useEffect, is dependant on the old value
  // it shouldn't use the state variable itself. Instead, it should use the functional form of the setSomething function or useReducer.
  //
  // Otherwise, if state variable would be used, then the useEffect will become dependent on this variable; but as soon as that state
  // would be added to the dependency array, any setSomething would cause an endless loop, since being a dependency, the change in state
  // would trigger another call of useEffect, which in turn will call setSomething again and so on.
  // Below I'm using the functional form of setSomthing to overcome eslint shouting at me or the endless loop.
  //
  // * useReducer considered better for such situations
  // using useReducer (instead of useState) is another way to get the old state value as argument:
  // useRedueer's 1st arument is a reducer function whose signature is the old state and an action.
  // To replace the below code with useRedcuer I would have to consolidate the 4 changes into one reducer function and name an action for each,
  // which each of the 4 would call with a 'dispatch' function and the proper action name. Very similar to a redux reducer.
  // What I don't get is that React docs say 'dispatch' can be passed within a context "unlike callbacks". I'm not sure why a 'setState' function
  // can't be passed within a context too. Anyway, I made all possible updates to BrowserContext defined in this one place
  // so I don't have to pass neither setSomething nor dispatch in a context.
  //

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
    </BrowserContext.Provider>
  )
}
