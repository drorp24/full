import React, { useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import Button from '@material-ui/core/Button'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepContent from '@material-ui/core/StepContent'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Debug from '../../utility/Debug'
import {
  Form,
  handleBlurGeneric,
  handleChangeGeneric,
  multiStepFormValidGeneric,
  withState,
} from './formUtilities'

const MultiStepForm = ({ state, setState, schema, structure }) => {
  const [activeStep, setActiveStep] = useState(0)

  function handleNext() {
    setActiveStep(prevActiveStep => prevActiveStep + 1)
  }

  function handleBack() {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  function handleReset() {
    setActiveStep(0)
  }

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

  const classes = useStyles()

  // This component updates a state that belongs to its ancestor component
  const handleBlur = e => {
    withState({ state, setState, schema })(handleBlurGeneric)(e)
  }

  const handleChange = async e => {
    withState({ state, setState, schema })(handleChangeGeneric)(e)
  }

  const formValid = step => multiStepFormValidGeneric(structure, step, state)

  return (
    // TODO: replace wrapper div with new <Box />, try doing w/o useStyles altogether
    <div className={classes.root}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {structure.map(({ label }, step) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              <Form
                state={state}
                onBlur={handleBlur}
                onChange={handleChange}
                structure={structure}
                step={activeStep}
                key={activeStep}
              />
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
                    {activeStep === structure.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </div>
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === structure.length && (
        <Paper square elevation={0} className={classes.resetContainer}>
          <Typography>All steps completed - you&apos;re finished</Typography>
          <Button onClick={handleReset} className={classes.button}>
            Reset
          </Button>
          <Button onClick={() => console.log('state: ', state)}>Submit</Button>
        </Paper>
      )}
      <div style={{ fontSize: '0.75em', textAlign: 'center' }}>
        <Debug objects={[state]} />
      </div>
    </div>
  )
}

export default MultiStepForm
