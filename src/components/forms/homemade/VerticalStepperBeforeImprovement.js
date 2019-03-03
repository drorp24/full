// Home-made form, based on Yup.js, with stepper navigation

import React, { useState } from 'react'
import { object, string, number, boolean } from 'yup'
import { makeStyles } from '@material-ui/styles'
import Button from '@material-ui/core/Button'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepContent from '@material-ui/core/StepContent'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(theme => ({
  root: {
    width: '90%',
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
}))

export default function SearchForm() {
  // though errors can be derived from state, i ended up including them in it
  // that's the easiest way to trigger re-rendering when an error occurs
  const [state, setState] = useState({
    values: {
      currency: 'USD',
      amount: 1000,
      delivery: false,
    },
    touched: {
      currency: false,
      amount: false,
      delivery: false,
    },
    errors: {
      currency: null,
      amount: null,
      delivery: null,
    },
  })

  const schema = object().shape({
    currency: string()
      .required()
      .min(3)
      .max(3)
      .matches(/(USD|EUR)/),
    amount: number()
      .required()
      .positive(),
    delivery: boolean(),
  })

  const check = async (field, value) => {
    try {
      await schema.validateAt(field, {
        [field]: value,
      })
      return false
    } catch (error) {
      return error.message
    }
  }

  // Unlike classes' setState, useState does not automatically merge update objects.
  // One can do that with spread syntax, provided setState's function form is used.
  const handleBlur = e => {
    const { name } = e.target

    setState(state => {
      return { ...state, touched: { ...state.touched, [name]: true } }
    })
  }

  const handleChange = async e => {
    const { name, value } = e.target
    const error = await check(name, value)

    setState(state => ({
      ...state,
      values: { ...state.values, [name]: value },
      touched: { ...state.touched, [name]: true },
      errors: { ...state.errors, [name]: error },
    }))
  }

  const handleSubmit = e => {
    e.preventDefault()

    console.log('Submitting values. state: ', state)
  }

  const [activeStep, setActiveStep] = useState(0)

  // Keep this the only place mapping each form to its content!
  const steps = [
    { label: 'What do you need', fields: ['currency', 'amount'] },
    { label: 'How do you want to get it', fields: ['delivery'] },
    { label: 'Something else', fields: ['delivery'] },
  ]

  const formValid = step =>
    // Assumption: initial form values are valid. Hence both false and null are ok
    Object.entries(state.errors).filter(
      entry => entry[1] && steps[step].fields.includes(entry[0])
    ).length === 0

  window.formValid = formValid
  window.state = state

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <ProductForm
            state={state}
            onBlur={handleBlur}
            onChange={handleChange}
          />
        )
      case 1:
        return (
          <ServiceForm
            state={state}
            onBlur={handleBlur}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        )
      case 2:
        return (
          <ServiceForm
            state={state}
            onBlur={handleBlur}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        )

      default:
        return 'Unknown step'
    }
  }

  function handleNext() {
    setActiveStep(prevActiveStep => prevActiveStep + 1)
  }

  function handleBack() {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  function handleReset() {
    setActiveStep(0)
  }

  const classes = useStyles()

  return (
    // TODO: replace wrapper div with new <Box />, try doing w/o useStyles altogether
    <div className={classes.root}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map(({ label }, step) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              {getStepContent(step)}
              <div className={classes.actionsContainer}>
                <div>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    className={classes.button}
                  >
                    Back
                  </Button>
                  <Button
                    disabled={!formValid(step)}
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    className={classes.button}
                  >
                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </div>
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} className={classes.resetContainer}>
          <Typography>All steps completed - you&apos;re finished</Typography>
          <Button onClick={handleReset} className={classes.button}>
            Reset
          </Button>
        </Paper>
      )}
    </div>
  )
}

// TODO: Make the 2 forms one component called Form, which gets only 'form' as parameter and generates its fields dynamically by 'steps'
// (Formik should make this rather easy)
const ProductForm = ({
  state: { values, errors, touched },
  onBlur,
  onChange,
}) => (
  <form autoComplete="off">
    <div>
      <input
        name="currency"
        type="text"
        placeholder="Currency"
        value={values.currency}
        onBlur={onBlur}
        onChange={onChange}
      />
    </div>
    <div>
      &nbsp;<span>{touched.currency && errors.currency}</span>
    </div>
    <div>
      <input
        name="amount"
        type="text"
        placeholder="Amount"
        value={values.amount}
        onBlur={onBlur}
        onChange={onChange}
      />
    </div>
    <div>
      &nbsp;<span>{touched.amount && errors.amount}</span>
    </div>
  </form>
)

const ServiceForm = ({
  state: { values, errors, touched },
  onBlur,
  onChange,
  onSubmit,
}) => (
  <form onSubmit={onSubmit} autoComplete="off">
    <div>
      <input
        name="delivery"
        type="text"
        placeholder="Delivery"
        value={values.delivery}
        onBlur={onBlur}
        onChange={onChange}
      />
    </div>
    <div>
      &nbsp;<span>{touched.delivery && errors.delivery}</span>
    </div>
  </form>
)
