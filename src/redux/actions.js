import { SET_MESSAGE, SET_COUNT, SET_SEARCH } from './types'

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

export const setSearch = search => ({
  type: SET_SEARCH,
  search,
})
