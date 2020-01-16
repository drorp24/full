import { ios, online, standalone } from './detect'
import { setDevice, setShouldClose } from '../../redux/actions'

export const initiateDeviceProperties = store => {
  const { dispatch } = store

  dispatch(
    setDevice({
      ios: ios(),
      online: online(),
      standalone: standalone(),
    })
  )

  window.addEventListener('beforeinstallprompt', e => {
    // This event is fired by Chrome adroid and desktop to signal that app is qualified to be installed ('add to home screen / A2HS')
    // The event is captured in redux to be fired whenever the app wants to.
    // The app can then use the chrome's native prompt (e.prompt()) if it wants to.
    e.preventDefault() // The default we're preventing is to display a bar on android Chrome
    dispatch(setDevice({ nativeInstall: e }))
  })

  window.addEventListener('online', e => {
    console.log('Online. e: ', e)
    dispatch(setDevice({ online: true }))
  })

  window.addEventListener('offline', e => {
    console.log('Offline. e: ', e)
    dispatch(setDevice({ online: false }))
  })

  window.addEventListener('orientationchange', e => {
    const orientation =
      window.screen.orientation.angle === 0 ? 'portrait' : 'landscape'
    dispatch(setDevice({ orientation }))
    if (orientation === 'landscape') dispatch(setShouldClose(true))
  })
}
