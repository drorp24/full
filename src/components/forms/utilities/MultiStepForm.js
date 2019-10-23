import React, { useState } from 'react'
import Button from '@material-ui/core/Button'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepContent from '@material-ui/core/StepContent'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
// import Debug from '../../utility/Debug'
import { Form, multiStepFormValidGeneric } from './formUtilities'

import { unstable_Box as Box } from '@material-ui/core/Box'

const MultiStepForm = ({ state, setState, structure }) => {
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

  const formValid = step => multiStepFormValidGeneric(structure, step, state)

  return (
    <Box>
      <Stepper activeStep={activeStep} orientation="vertical">
        {structure.map(({ label }, step) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              <Form
                state={state}
                setState={setState}
                structure={structure}
                step={activeStep}
                key={activeStep}
              />
              <div>
                <div>
                  <Button disabled={activeStep === 0} onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    disabled={!formValid(step)}
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
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
        <Paper square elevation={0}>
          <Typography>All steps completed - you&apos;re finished</Typography>
          <Button onClick={handleReset}>Reset</Button>
          <Button onClick={() => console.log('state: ', state)}>Submit</Button>
        </Paper>
      )}
      {/* <div style={{ fontSize: '0.75em', textAlign: 'center' }}>
        <Debug objects={[state]} />
      </div> */}
    </Box>
  )
}

export default MultiStepForm
