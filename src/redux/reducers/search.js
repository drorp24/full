import { SET_SEARCH } from '../types'

const initialState = {}

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_SEARCH:
      return {
        ...state,
        ...action.search,
      }
    default:
      return state
  }
}
