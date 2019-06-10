import Geocode from 'react-geocode'
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete'
import { produce } from 'immer'

// Promisfy and configure the basic html5 geolocation API
export const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject('This browser does not support geolocation')
    } else {
      return navigator.geolocation.getCurrentPosition(resolve, reject, {
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
    console.error(error.toString())
  }
}

export const getLocationAndAddress = async () => {
  const result = {}
  let position

  try {
    position = await getCurrentPosition()
    const { latitude, longitude } = position.coords
    result.location = { lat: latitude, lng: longitude, error: false }
  } catch (error) {
    result.location = { ...result.location, error: error.toString() }
  }

  if (position) {
    try {
      const address = await getAddress(position)
      result.address = address
    } catch (error) {
      result.address = error.toString()
    }
  }

  return result
}

export const OLD_getPositionAndAddress = async setState => {
  try {
    const position = await getCurrentPosition()
    setState(
      produce(draft => {
        draft.geolocation = { position }
        const { latitude, longitude } = position.coords
        draft.values.location = { lat: latitude, lng: longitude, error: false }
      })
    )
    const address = await getAddress(position)
    setState(
      produce(draft => {
        draft.geolocation.address = address
        draft.values.center = address
      })
    )
  } catch (error) {
    setState(
      produce(draft => {
        draft.geolocation = { error: error.toString() }
        draft.values.location = { error: error.toString() }
      })
    )
  }
}

// ! worked
// I struggled with it for 2 days: for some reason (my lack of knowledge maybe), geocode1 below does *not* return a Promise
// though it returns geocodeByAddress which itself is a Promise. WTF.
// I had to explicitly return a new Promise for 'geocode''s then to really be performed only once geocode itself resolved.
export const geocode = ({ address }) => {
  return new Promise(function(resolve, reject) {
    geocodeByAddress(address)
      .then(results => {
        getLatLng(results[0]).then(location => {
          const { lat, lng } = location
          resolve({ lat, lng, error: false })
        })
      })
      .catch(error => {
        console.warn('geocodeByAddress error', error)
        resolve({ lat: null, lng: null, error })
      })
  })
}

// ! did not work
// This one did not respect the 'then' on it (geocode.then did not await geocode to resolve)
export const geocode1 = ({ address }) =>
  geocodeByAddress(address)
    .then(results => {
      getLatLng(results[0]).then(location => {
        const { lat, lng } = location
        return { lat, lng, error: false }
      })
    })
    .catch(error => {
      console.warn('geocodeByAddress error', error)
      return { lat: null, lng: null, error }
    })

export const address = state =>
  (state.geolocation && state.geolocation.address) || ''
