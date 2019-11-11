import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

// import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { Form, multiStepFormValidGeneric } from './formUtilities'

const OneStepper = ({ structure, show, ...rest }) => {
  const form = useSelector(store => store.form)
  const formValid = () => multiStepFormValidGeneric(structure, 0, form)

  // const useStyles = makeStyles(theme => ({
  //   btn: {
  //     backgroundColor: theme.palette.primary.main,
  //   },
  // }))

  // const classes = useStyles()

  const footer = () => (
    <Grid container justify="center">
      <Button
        variant="contained"
        color="primary"
        // className={classes.btn}
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
