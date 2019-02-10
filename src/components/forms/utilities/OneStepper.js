import React from 'react'
import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { Form, multiStepFormValidGeneric } from './formUtilities'

const OneStepper = ({ state, setState, schema, structure }) => {
  const formValid = () => multiStepFormValidGeneric(structure, 0, state)

  const footer = () => (
    <Grid container justify="center">
      <Button
        component={Link}
        to={`/${structure[0].next}`}
        disabled={!formValid()}
      >
        {structure[0].submit || 'save'}
      </Button>
    </Grid>
  )

  return (
    <Form
      state={state}
      setState={setState}
      schema={schema}
      structure={structure}
      step={0}
      footer={footer}
    />
  )
}

export default OneStepper
