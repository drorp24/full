//  See my note about cross-cutting reducers

import { combineReducers } from 'redux'
import text from './text'
import counter from './counter'
import form from './form'
import lists from './lists'
import app from './app'
import user from './user'
import device from './device'

export default combineReducers({
  text,
  counter,
  form,
  lists,
  app,
  user,
  device,
})
