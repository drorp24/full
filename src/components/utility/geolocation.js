import Geocode from 'react-geocode'
import merge from 'lodash.merge'

// Promisfy and configure the basic html5 geolocation API
export const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject('This browser does not support geolocation')
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      })
    }
  })

export const getAddress = async ({ coords: { latitude, longitude } }) => {
  Geocode.setApiKey(process.env.REACT_APP_GOOGLE_API_KEY)

  window.Geocode = Geocode
  try {
    const response = await Geocode.fromLatLng(latitude, longitude)
    const address = response.results[0].formatted_address
    return address
  } catch (error) {
    // Geocode returns an Error object that cannot be recorded in state
    throw error.toString()
  }
}

export const getPositionAndAddress = async setState => {
  try {
    const position = await getCurrentPosition()
    setState(state => merge(state, { geolocation: { error: null, position } }))
    const address = await getAddress(position)
    setState(state => merge(state, { geolocation: { error: null, address } }))
  } catch (error) {
    setState(state =>
      merge(state, { geolocation: { error: error.toString() } })
    )
  }
}

export const address = state =>
  (state.geolocation && state.geolocation.address) || ''
