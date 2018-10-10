import { SET_MESSAGE, ADD_CLICK } from './types'

export const setMessage = message => ({
  type: SET_MESSAGE,
  message,
})

// using thunk enables to control what to dispatch, when and on what condition
// it also enables the action creator to be exposed to the *entire* state
// here i'm using it to dispatch an action that updates another state branch, based on a state of another branch
export const addClick = () => (dispatch, getState) => {
  const {
    counter: { clicks },
    text: { message },
  } = getState()
  const overflowMessage = 'over 5 clicks!'

  if (clicks > 4 && message !== overflowMessage) {
    dispatch(setMessage(overflowMessage))
  }

  dispatch({
    type: ADD_CLICK,
  })
}
