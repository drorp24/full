import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import Fab from '@material-ui/core/Fab'
import MySvg from '../../utility/svg'
import Grid from '@material-ui/core/Grid'
import { Form, multiStepFormValidGeneric } from './formUtilities'

const OneStepper = ({ structure, show, ...rest }) => {
  const form = useSelector(store => store.form)
  const formValid = () => multiStepFormValidGeneric(structure, 0, form)

  const footer = () => (
    <Grid container justify="center" alignItems="center">
      <Fab
        color="primary"
        component={Link}
        to={`/${show.next}`}
        disabled={!formValid()}
        size="large"
        variant="extended"
      >
        <MySvg icon="search" />
        Find offers
      </Fab>
    </Grid>
  )

  return <Form {...{ structure, show, step: 0, footer, ...rest }} />
}

export default OneStepper
