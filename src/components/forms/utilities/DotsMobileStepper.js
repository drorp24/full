import React, { useState } from 'react'
import MobileStepper from '@material-ui/core/MobileStepper'
import Button from '@material-ui/core/Button'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import { Form, multiStepFormValidGeneric } from './formUtilities'

const DotsMobileStepper = ({ state, setState, schema, structure }) => {
  const [activeStep, setActiveStep] = useState(0)

  function handleNext() {
    setActiveStep(prevActiveStep => {
      // [NO NEED TO] extract out formUtilities.js/handleChangeGeneric/'check' into its own function
      // programmatically "touch" every untouched field in current step, run 'check' and setState
      // the above is precisely handleChangeGeneric with fake props/e parameter
      // once all untouched fields in currenct steps have been touched & checked, check if formValid(step)
      // and only if valid, return prevActiveSte + 1 (next line)
      return prevActiveStep + 1
    })
  }

  function handleBack() {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const formValid = step => multiStepFormValidGeneric(structure, step, state)

  const footer = step => (
    <MobileStepper
      variant="dots"
      steps={3}
      position="static"
      activeStep={step}
      nextButton={
        <Button
          size="small"
          onClick={handleNext}
          disabled={!formValid(step) || step === 2}
        >
          Next
          <KeyboardArrowRight />
        </Button>
      }
      backButton={
        <Button size="small" onClick={handleBack} disabled={step === 0}>
          <KeyboardArrowLeft />
          Back
        </Button>
      }
    />
  )

  return (
    <Form
      state={state}
      setState={setState}
      schema={schema}
      structure={structure}
      step={activeStep}
      footer={footer}
    />
  )
}

export default DotsMobileStepper
