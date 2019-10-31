import React from 'react'
import { ios, standalone } from './detect'

export const BrowserContext = React.createContext()

export const populateBrowserContext = () => {
  const browserContext = {
    ios: ios(),
    standalone: standalone(),
    nativeInstall: null,
    online: true,
  }
  window.addEventListener('beforeinstallprompt', e => {
    // This event is fired by Chrome adroid and desktop to signal that app is qualified to be installed ('add to home screen / A2HS')
    // The event is captured in the browserContext to be fired whenever the app wants to.
    // The app can then use the chrome's native prompt (e.prompt()) is desired.
    browserContext.nativeInstall = e
  })

  window.addEventListener('online', e => {
    console.log('Online. e: ', e)
    browserContext.online = true
  })

  window.addEventListener('offline', e => {
    console.log('Offline. e: ', e)
    browserContext.online = false
  })

  // by the time it is viewd in the console, the 'beforeinstallprompt' and 'online' keys should be populated
  console.log('browserContext:', browserContext)
  window.browserContext = browserContext

  return browserContext
}
