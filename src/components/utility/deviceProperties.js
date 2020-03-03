import { ios, online, standalone } from './detect'
import { setDevice, setShouldClose } from '../../redux/actions'

export const initiateDeviceProperties = ({ dispatch }) => {
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

  // ! orientation change is handled both declaratively and imperatively
  // Orientation change has 2 effects:
  //
  // - Components such as <Page />,  <SnackBar /> and <A2HS /> use the CSS mediaQuery for styling in a declarative manner as expected
  // - the following imperative code dispatches 'setShouldClose'
  //
  //    I suppose I could have the mediaQuery control the 'open' state of the card as well,
  //    but since 'setShouldClose' is anyway required for when user clicks the 'X' on the AppBar,
  //    I might as well use it here too as it's easier to close the card that way.
  //    It actually makes sense to handle user rotating the device imperatively, as a user clicking the 'X' is handled.
  //
  //  2 benefits of defining the event on the mediaQuery rather than using the 'orientationchange' event:
  //    - Defining an event on the very same merdiaQuery the CSS uses for consistentcy
  //    - Making iOS detect the orientation, as screen.angle is not yet supported by iOS.
  //
  const mql = window.matchMedia('(orientation: portrait)')

  function handleOrientationChange(e) {
    const orientation = e.matches ? 'portrait' : 'landscape'
    dispatch(setDevice({ orientation }))
    if (orientation === 'landscape') dispatch(setShouldClose(true))
  }

  mql.addListener(handleOrientationChange)
}
