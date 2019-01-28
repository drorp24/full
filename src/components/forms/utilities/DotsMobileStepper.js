import React, { useState } from 'react'
import MobileStepper from '@material-ui/core/MobileStepper'
import Button from '@material-ui/core/Button'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import {
  Form,
  multiStepFormValidGeneric,
  handleChangeGeneric,
} from './formUtilities'

const DotsMobileStepper = ({ state, setState, schema, structure }) => {
  const [activeStep, setActiveStep] = useState(0)

  function handleNext() {
    setActiveStep(prevActiveStep => {
      const visitUntouched = () => {
        structure[prevActiveStep].fields.forEach(field => {
          const { name } = field
          const {
            touched: { [name]: isTouched },
            values: { [name]: value },
          } = state
          if (isTouched) return
          const props = { target: { name, value } }
          handleChangeGeneric({ props, state, setState, schema })
        })
      }

      visitUntouched()

      const stepHasErrors = structure[prevActiveStep].fields.some(
        field => !!state.errors[field.name]
      )

      return stepHasErrors ? prevActiveStep : prevActiveStep + 1
    })
  }

  function handleBack() {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const formValid = step => multiStepFormValidGeneric(structure, step, state)

  const footer = step => (
    <MobileStepper
      variant="dots"
      steps={structure.length}
      position="static"
      activeStep={step}
      nextButton={
        <Button
          size="small"
          onClick={handleNext}
          disabled={!formValid(step) || step === structure.length - 1}
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
    <Form // Called again for every keystroke. memoization didn't change that.
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
