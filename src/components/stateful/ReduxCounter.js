import React from 'react'
import { connect } from 'react-redux'
import { setCount } from '../../store/actions'

const Counter = props => (
  <button onClick={props.setCount}>Redux - {props.count} Clicks</button>
)

export default connect(
  ({ counter: { count } }) => ({
    count,
  }),
  {
    setCount,
  }
)(Counter)
