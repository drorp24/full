import { clearTouched } from '../../redux/actions'

export const cleanTouched = ({ dispatch }) => {
  dispatch(clearTouched())
}
