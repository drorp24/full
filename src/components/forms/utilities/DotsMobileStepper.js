import React, { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setForm } from '../../../redux/actions'

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

const DotsMobileStepper = ({ structure, show }) => {
  const [activeStep, setActiveStep] = useState(0)
  const form = useSelector(store => store.form)
  const dispatch = useDispatch()
  const updateForm = useCallback(form => dispatch(setForm(form)), [dispatch])
  // above: 'useCallback' is used since the recommendation is to pass to children the memoized version of the dispatch ('updateForm') rather than the 'dispatch' function itself

  // 'setActiveStep' needs 'form' and 'updateForm' props since being a nested function it cannot access any hook
  // 'Form' on the other hand doesn't need them, as being a React function it can access them both by itself using the redux hooks.
  function handleNext() {
    setActiveStep(prevActiveStep => {
      visitUntouched({
        form,
        updateForm,
        structure,
        step: prevActiveStep,
      })

      const stepHasErrors = structure[prevActiveStep].fields.some(
        field => !!form.errors[field.name]
      )

      return stepHasErrors ? prevActiveStep : prevActiveStep + 1
    })
  }

  function handleBack() {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const formValid = step => multiStepFormValidGeneric(structure, step, form)

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
    <Form structure={structure} show={show} step={activeStep} footer={footer} />
  )
}

export default DotsMobileStepper
