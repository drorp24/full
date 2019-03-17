//  See my note about cross-cutting reducers

import { combineReducers } from 'redux'
import text from './text'
import counter from './counter'

export default combineReducers({
  text,
  counter,
})
