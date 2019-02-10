import React from 'react'
import DotsMobileStepper from './DotsMobileStepper'
import OneStepper from './OneStepper'

const FormContainr = ({ state, setState, schema, structure }) =>
  structure.length > 1 ? (
    <DotsMobileStepper
      state={state}
      setState={setState}
      schema={schema}
      structure={structure}
    />
  ) : (
    <OneStepper
      state={state}
      setState={setState}
      schema={schema}
      structure={structure}
    />
  )

export default FormContainr
