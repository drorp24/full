// Formikated VerticalStepper, with 3 separate Formik states accumulated into 'state'

import React, { useState, useEffect } from 'react'
import { object, string, number, boolean } from 'yup'
import { makeStyles } from '@material-ui/styles'
import Button from '@material-ui/core/Button'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepContent from '@material-ui/core/StepContent'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { Formik } from 'formik'
import merge from 'lodash.merge'

const useStyles = makeStyles(theme => ({
  root: {
    width: '90%',
  },
  button: {
    marginTop: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  actionsContainer: {
    marginBottom: theme.spacing.unit * 2,
  },
  resetContainer: {
    padding: theme.spacing.unit * 3,
  },
}))

export default function SearchForm() {
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

  window.state = state

  const updateState = (values, touched, errors) => {
    console.log('updateState called')
    const oldStateClone = Object.assign({}, state)
    console.log('state before update: ', oldStateClone)
    const changeToMerge = { values, touched, errors }
    console.log('changeToMerge: ', changeToMerge)
    const newState = merge(oldStateClone, changeToMerge)
    const newStateClone = Object.assign({}, newState)
    console.log('newState: ', newStateClone)
    setState(newState)
    console.log(
      'state.values.currency at the end of updateState: ',
      state.values.currency
    )
  }

  const [activeStep, setActiveStep] = useState(0)

  // Keep this the only place mapping each form to its content!
  const steps = [
    { label: 'What do you need', fields: ['currency', 'amount'] },
    { label: 'How do you want to get it', fields: ['delivery'] },
    { label: 'Something else', fields: ['delivery'] },
  ]

  function getStepContent(step) {
    switch (step) {
      case 0:
        return <ProductForm updateState={updateState} />
      case 1:
        return <ServiceForm updateState={updateState} />
      case 2:
        return <ServiceForm updateState={updateState} />

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

  function handleSubmit() {
    console.log('Submitting values. state: ', state)
  }

  const classes = useStyles()

  return (
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
                    // disabled={!formValid(step)}
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
          <Button onClick={handleSubmit} className={classes.button}>
            Submit
          </Button>
        </Paper>
      )}
    </div>
  )
}

// Each of the separate Formik components has its own separate state, managed by its Formik component
// The 'state' hook accumulates all these separate states in one place
// and the "submit" button (which is not any of the forms' submit button) sends the 'state' values
const ProductForm = ({ updateState }) => {
  const form = ({ handleChange, handleBlur, values, touched, errors }) => {
    // useEffect(
    //   () => {
    //     updateState(values, touched, errors)
    //   },
    //   [values, touched, errors]
    // )

    // updateState(values, touched, errors)
    const myHandleChange = e => {
      console.log('e.target.value: ', e.target.value)
      handleChange(e)
      // updateState(values, touched, errors)
    }

    console.log(
      'Entering ProductForm. values.currency: ',
      values.currency,
      ' errors.currency: ',
      errors.currency
    )

    // updateState(values, touched, errors)

    return (
      <form autoComplete="off">
        <div>
          <input
            name="currency"
            type="text"
            placeholder="Currency"
            value={values.currency}
            onBlur={handleBlur}
            onChange={myHandleChange}
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
            onBlur={handleBlur}
            onChange={handleChange}
          />
        </div>
        <div>
          &nbsp;<span>{touched.amount && errors.amount}</span>
        </div>
      </form>
    )
  }

  return (
    <Formik
      initialValues={{
        currency: 'USD',
        amount: 1000,
      }}
      isInitialValid={true}
      validationSchema={object().shape({
        currency: string()
          .required()
          .min(3)
          .max(3)
          .matches(/(USD|EUR)/),
        amount: number()
          .required()
          .positive(),
      })}
      component={form}
    />
  )
}

const ServiceForm = ({ updateState }) => (
  <Formik
    initialValues={{
      delivery: false,
    }}
    isInitialValid={true}
    validationSchema={object().shape({
      delivery: boolean(),
    })}
  >
    {({ handleChange, handleBlur, values, touched, errors }) => {
      const myHandleChange = e => {
        handleChange(e)
        updateState(values, touched, errors)
      }

      return (
        <form autoComplete="off">
          <div>
            <input
              name="delivery"
              type="text"
              placeholder="Delivery"
              value={values.delivery}
              onBlur={handleBlur}
              onChange={myHandleChange}
            />
          </div>
          <div>
            &nbsp;<span>{touched.delivery && errors.delivery}</span>
          </div>
        </form>
      )
    }}
  </Formik>
)
