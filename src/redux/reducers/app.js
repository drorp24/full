import { SET_APP } from '../types'

const initialState = {
  fullscreen: false,
}

export default (state = initialState, action) => {
  const { type, app } = action
  switch (type) {
    case SET_APP:
      return app

    default:
      return state
  }
}
