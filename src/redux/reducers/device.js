// That's the simplest way to handle an update to a redux store key (aka selector)
import { SET_DEVICE } from '../types'

const initialState = {
  ios: null,
  standalone: null,
  online: null,
  nativeInstall: null,
  newerSwWaiting: null,
  contentCached: null,
  appShared: null,
  orientation: null,
  mode: 'light',
}

export default (state = initialState, action) => {
  const { type, payload } = action
  switch (type) {
    case SET_DEVICE:
      return { ...state, ...payload }
    default:
      return state
  }
}
