import Geocode from 'react-geocode'
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete'
import { produce } from 'immer'

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
    setState(
      produce(draft => {
        draft.geolocation = { position }
        const { latitude, longitude } = position.coords
        draft.values.latLng = { lat: latitude, lng: longitude, error: false }
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
        draft.values.latLng = { error: error.toString() }
      })
    )
  }
}

export const geocode = ({ value, setState }) => {
  geocodeByAddress(value)
    .then(results => {
      getLatLng(results[0]).then(latLng => {
        setState(
          produce(draft => {
            const { lat, lng } = latLng
            draft.values.latLng = { lat, lng, error: false }
          })
        )
      })
    })
    .catch(error => {
      setState(
        produce(draft => {
          draft.values.latLng = { error }
        })
      )
      console.warn('geocodeByAddress error', error)
    })
}

export const address = state =>
  (state.geolocation && state.geolocation.address) || ''
