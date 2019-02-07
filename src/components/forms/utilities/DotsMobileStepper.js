import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import MobileStepper from '@material-ui/core/MobileStepper'
import Button from '@material-ui/core/Button'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import {
  Form,
  multiStepFormValidGeneric,
  visitUntouched,
} from './formUtilities'

const DotsMobileStepper = ({ state, setState, schema, structure, show }) => {
  const [activeStep, setActiveStep] = useState(0)

  function handleNext() {
    setActiveStep(prevActiveStep => {
      visitUntouched({
        state,
        setState,
        schema,
        structure,
        step: prevActiveStep,
      })

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
        step < structure.length - 1 ? (
          <Button size="small" onClick={handleNext} disabled={!formValid(step)}>
            Next
            <KeyboardArrowRight />
          </Button>
        ) : (
          <Button
            component={Link}
            to={`/${show.next}`}
            size="small"
            disabled={!formValid(step)}
          >
            {show.submit || 'save'}
            <KeyboardArrowRight />
          </Button>
        )
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
      show={show}
    />
  )
}

export default DotsMobileStepper
