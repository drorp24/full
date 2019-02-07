import React from 'react'
import DotsMobileStepper from './DotsMobileStepper'
import OneStepper from './OneStepper'

const FormContainr = props =>
  props.structure.length > 1 ? (
    <DotsMobileStepper {...props} />
  ) : (
    <OneStepper {...props} />
  )

export default FormContainr
