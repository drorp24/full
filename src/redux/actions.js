import {
  SET_MESSAGE,
  SET_COUNT,
  SET_FORM,
  SET_FORM_VALUES,
  SET_FORM_SCHEMA,
  SET_LIST,
  SET_APP,
  SET_CONTEXTUAL,
  SHOULD_CLOSE,
  TOGGLE_VIEW,
  SET_POPULATED,
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

export const setFormSchema = schema => ({
  type: SET_FORM_SCHEMA,
  schema,
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
