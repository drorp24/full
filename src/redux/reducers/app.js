import { SET_APP, SET_CONTEXTUAL, SHOULD_CLOSE } from '../types'

const initialState = {
  contextual: false,
  name: null,
  shouldClose: false,
}

export default (state = initialState, action) => {
  const { type, app, contextual, name, shouldClose } = action // last 3 are mutually exclusive but I can still destructure them
  switch (type) {
    case SET_APP:
      return app // 'app' has the entire selector, while 'contextual' and 'shouldClose' are parts of that selector hence the difference
    case SET_CONTEXTUAL:
      return { ...state, contextual, name }
    case SHOULD_CLOSE:
      return { ...state, shouldClose }
    default:
      return state
  }
}
