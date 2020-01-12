import {
  SET_APP,
  SET_CONTEXTUAL,
  SHOULD_CLOSE,
  TOGGLE_VIEW,
  SET_POPULATED,
  TOGGLE_LAYOUT,
} from '../types'

const initialState = {
  contextual: false,
  name: null,
  shouldClose: false,
  view: 'list',
  layout: 'vertical',
  populated: {
    state: false,
    currencies: false,
    coins: false,
  },
}

export default (state = initialState, action) => {
  const { type, app, contextual, name, shouldClose, field } = action // last 3 are mutually exclusive but I can still destructure them
  switch (type) {
    case SET_APP:
      return app // 'app' has the entire selector, while 'contextual' and 'shouldClose' are parts of that selector hence the difference
    case SET_CONTEXTUAL:
      return { ...state, contextual, name }
    case SHOULD_CLOSE:
      return { ...state, shouldClose }
    case TOGGLE_VIEW:
      return { ...state, view: state.view === 'list' ? 'map' : 'list' }
    case TOGGLE_LAYOUT:
      return {
        ...state,
        layout: state.layout === 'horizontal' ? 'vertical' : 'horizontal',
      }
    case SET_POPULATED:
      return { ...state, populated: { ...state.populated, [field]: true } }
    default:
      return state
  }
}
