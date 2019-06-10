import { SET_MESSAGE } from '../types'

const initialState = {
  message: null,
}

export default (state = initialState, action) => {
  const { type, message } = action
  switch (type) {
    case SET_MESSAGE:
      return message

    default:
      return state
  }
}
