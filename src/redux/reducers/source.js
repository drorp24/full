import { SET_SOURCE } from '../types'

const initialState = {
  source: null,
}

export default (state = initialState, action) => {
  const { type, source } = action
  switch (type) {
    case SET_SOURCE:
      return source

    default:
      return state
  }
}
