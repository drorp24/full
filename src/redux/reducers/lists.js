import { SET_LIST } from '../types'

const initialState = {}

export default (state = initialState, action) => {
  const { type, name, list, quote } = action
  switch (type) {
    case SET_LIST:
      return {
        ...state,
        [name]: list,
        quote,
      }
    default:
      return state
  }
}
