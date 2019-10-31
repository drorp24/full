export const requestDeviceMotion = setPermissionGranted => {
  if (
    DeviceMotionEvent &&
    typeof DeviceMotionEvent.requestPermission === 'function'
  ) {
    DeviceMotionEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          window.addEventListener('devicemotion', () => {})
          setPermissionGranted(true)
        }
      })
      .catch(console.error)
  } else if (
    DeviceOrientationEvent &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', () => {})
          setPermissionGranted(true)
        }
      })
      .catch(console.error)
  } else {
    console.log(
      'Neither DeviceMotionEvent nor DeviceOrientationEvent are supported'
    )
  }
}
