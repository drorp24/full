import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { Form, multiStepFormValidGeneric } from './formUtilities'

const OneStepper = ({ structure, show, ...rest }) => {
  const form = useSelector(store => store.form)
  const formValid = () => multiStepFormValidGeneric(structure, 0, form)

  const footer = () => (
    <Grid container justify="center">
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to={`/${show.next}`}
        disabled={!formValid()}
        size="large"
      >
        {show.submit || 'save'}
      </Button>
    </Grid>
  )

  return <Form {...{ structure, show, step: 0, footer, ...rest }} />
}

export default OneStepper
