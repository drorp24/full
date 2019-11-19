import {
  SET_MESSAGE,
  SET_COUNT,
  SET_FORM,
  SET_FORM_VALUES,
  SET_LIST,
  SET_APP,
  SET_CONTEXTUAL,
  SHOULD_CLOSE,
  TOGGLE_VIEW,
  SET_POPULATED,
  SET_A2HS,
  SET_DEVICE,
} from './types'

export const setMessage = message => ({
  type: SET_MESSAGE,
  message,
})

// using thunk enables to control what to dispatch, when and on what condition
// it also enables the action creator to be exposed to the *entire* state
// here i'm using it to dispatch an action that updates another state branch, based on a state of another branch
export const setCount = () => (dispatch, getState) => {
  const {
    counter: { count },
    text: { message },
  } = getState()
  const overflowMessage = 'over 5 clicks!'

  if (count > 4 && message !== overflowMessage) {
    dispatch(setMessage(overflowMessage))
  }

  dispatch({
    type: SET_COUNT,
  })
}

export const setForm = form => ({
  type: SET_FORM,
  form,
})

export const setFormValues = values => ({
  type: SET_FORM_VALUES,
  values,
})

export const setList = ({ name, list, quote }) => ({
  type: SET_LIST,
  name,
  list,
  quote,
})

export const setApp = app => ({
  type: SET_APP,
  app,
})

export const setContextual = ({ contextual, name }) => ({
  type: SET_CONTEXTUAL,
  contextual,
  name,
})

export const setShouldClose = shouldClose => ({
  type: SHOULD_CLOSE,
  shouldClose,
})

export const toggleView = () => ({
  type: TOGGLE_VIEW,
})

export const setPopulated = field => ({
  type: SET_POPULATED,
  field,
})

export const setA2hs = a2hs => ({
  type: SET_A2HS,
  a2hs,
})

export const setDevice = payload => ({
  type: SET_DEVICE,
  payload,
})

// ! generic setting
// Will work with any reducer that accepts {type, payload} (e.g., device.js)
// saves the need to define here a new function for every new reducer / action
// particulalry useful when value needs to be temporarily set, such as when a message should be displayed for a potentially reccurring event
// to make 'temporarily' simple, 'setValue' accepts only one key-value pair and the value must be boolean
export const setValue = (type, key, value) => ({
  type,
  payload: { [key]: value },
})

// ! self-removing value setting
// Turns ongoing states into periodical events, whose frequency I can control
// Useful to periodically remind user of states which by nature are ongoing.
export const temporarilySetValue = (type, key, value, time = 10) => {
  return dispatch => {
    dispatch(setValue(type, key, value))
    setTimeout(() => {
      const negValue = !value
      dispatch(setValue(type, key, negValue))
    }, time * 1000)
  }
}
