// That's the simplest way to handle an update to a redux store key (aka selector)
import { SET_FORM } from '../types'

const initialState = { values: null, touched: null, errors: {}, dror: 3 }

// Return the *content* of the store key/selector
// The key itself will be placed by combineReducers
// prefix with ...state only when updating a *part* of the selector, such as one of several lists in SET_LIST (lists.js)
// remember that state provided in the 1st argument is the content of that particular selector, not the entire store
export default (state = initialState, action) => {
  const { type, form } = action
  switch (type) {
    case SET_FORM:
      return form
    default:
      return state
  }
}
