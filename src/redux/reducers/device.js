// That's the simplest way to handle an update to a redux store key (aka selector)
import { SET_DEVICE } from '../types'

// ! My attempt at reducing redux' horrible overhead
// I should probably be using redux-toolkit or however it's called, but until then,
// at least with device selector, I'm going to allow one activity type only which is SET_DEVICE
// and save myself creating a new: type and a new action/function in actions for each and every new switch I add to device
// which can be dozens. I also will stop importing the action types which stand for the very same strings.
// Yes, that puts the responsibility of knowing the current/old state on the calling component plus the logic,
// but are on/off switches, not rocket science.
//
// Of course I should learn and start using reudx-toolkit.

const initialState = {
  ios: null,
  standalone: null,
  online: null,
  nativeInstall: null,
  newerSwWaiting: null,
  contentCached: null,
  appShared: null,
  orientation: 'portrait',
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
