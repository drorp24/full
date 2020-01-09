import { setValue } from '../../redux/actions'

const toggleMode = ({ mode, dispatch }) => () =>
  dispatch(
    setValue({
      type: 'SET_DEVICE',
      key: 'mode',
      value: mode && mode === 'light' ? 'dark' : 'light',
    })
  )

export default toggleMode
