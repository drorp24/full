//  See my note about cross-cutting reducers

import { combineReducers } from 'redux'
import text from './text'
import counter from './counter'
import form from './form'
import lists from './lists'

export default combineReducers({
  text,
  counter,
  form,
  lists,
})
