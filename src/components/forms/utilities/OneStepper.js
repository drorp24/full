import React from 'react'
import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { Form, multiStepFormValidGeneric } from './formUtilities'

const OneStepper = ({ structure, state, show, ...rest }) => {
  const formValid = () => multiStepFormValidGeneric(structure, 0, state)

  const footer = () => (
    <Grid container justify="center">
      <Button component={Link} to={`/${show.next}`} disabled={!formValid()}>
        {show.submit || 'save'}
      </Button>
    </Grid>
  )

  return (
    <Form
      structure={structure}
      state={state}
      show={show}
      footer={footer}
      step={0}
      {...rest}
    />
  )
}

export default OneStepper
