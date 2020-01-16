import {
  SET_APP,
  SET_CONTEXTUAL,
  SHOULD_CLOSE,
  TOGGLE_VIEW,
  SET_POPULATED,
  TOGGLE_LAYOUT,
  TOGGLE_KEY,
} from '../types'

const initialState = {
  contextual: false,
  name: null,
  shouldClose: false,
  view: 'list',
  layout: 'vertical',
  scrolling: null,
  populated: {
    state: false,
    currencies: false,
    coins: false,
  },
}

export default (state = initialState, action) => {
  const { type, contextual, name, shouldClose, field, payload, key } = action // last 3 are mutually exclusive but I can still destructure them
  switch (type) {
    case SET_APP:
      return { ...state, ...payload }
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
    case TOGGLE_KEY:
      return { ...state, [key]: !state[key] }
    default:
      return state
  }
}
