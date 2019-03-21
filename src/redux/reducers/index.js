//  See my note about cross-cutting reducers

import { combineReducers } from 'redux'
import text from './text'
import counter from './counter'
import search from './search'

export default combineReducers({
  text,
  counter,
  search,
})
