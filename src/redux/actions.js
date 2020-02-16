import {
  SET_SOURCE,
  SET_COUNT,
  SET_FORM,
  SET_FORM_VALUES,
  SET_LIST,
  SET_APP,
  SET_CONTEXTUAL,
  SHOULD_CLOSE,
  TOGGLE_VIEW,
  TOGGLE_LAYOUT,
  SET_POPULATED,
  SET_A2HS,
  SET_DEVICE,
  SET_USER,
} from './types'

export const setSource = source => ({
  type: SET_SOURCE,
  source,
})

// using thunk enables to control what to dispatch, when and on what condition
// it also enables the action creator to be exposed to the *entire* state
// here i'm using it to dispatch an action that updates another state branch, based on a state of another branch
export const setCount = () => (dispatch, getState) => {
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

export const toggleLayout = () => ({
  type: TOGGLE_LAYOUT,
})

export const setPopulated = field => ({
  type: SET_POPULATED,
  field,
})

export const setA2hs = a2hs => ({
  type: SET_A2HS,
  a2hs,
})

export const setApp = payload => ({
  type: SET_APP,
  payload,
})

export const setDevice = payload => ({
  type: SET_DEVICE,
  payload,
})

export const setUser = payload => ({
  type: SET_USER,
  payload,
})

// ! generic setting
// Will work with any reducer that accepts {type, payload} (e.g., device.js)
// saves the need to define here a new function for every new reducer / action
// particulalry useful when value needs to be temporarily set, such as when a message should be displayed for a potentially reccurring event
// to make 'temporarily' simple, 'setValue' accepts only one key-value pair and the value better be boolean
export const setValue = ({ type, key, value }) => ({
  type,
  payload: { [key]: value },
})

// ! self-removing value setting
// Turns ongoing states into periodical events, whose frequency I can control
// Useful to periodically remind user of states which by nature are ongoing.
//
// Unlike the other actions here, it returns a function of 'dispatch'
// rather than directly returning an activity object
// This form of action is accepted thanks to 'thunk' being included.
// It is done that way since the activity's effect is async -
// a second 'dispatch' is scheduled to take place a few seconds after the first one.
export const temporarilySetValue = ({
  type,
  key,
  value,
  time = 10,
  toggle = true,
}) => dispatch => {
  dispatch(setValue({ type, key, value }))
  setTimeout(() => {
    const resetValue = toggle ? !value : null
    dispatch(setValue({ type, key, resetValue }))
  }, time * 1000)
}

// Will work with any single-level boolean if its reducer supports 'TOGGLE_KEY' (currently: 'app')
export const toggleKey = key => ({
  type: 'TOGGLE_KEY',
  key,
})
