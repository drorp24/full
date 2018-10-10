import { ADD_CLICK } from '../types'

const initialState = {
  clicks: 0,
}

export default (state = initialState, action) => {
  switch (action.type) {
    case ADD_CLICK:
      return {
        ...state,
        clicks: state.clicks + 1,
      }
    default:
      return state
  }
}
