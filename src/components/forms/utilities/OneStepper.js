import React from 'react'
import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { Form, multiStepFormValidGeneric } from './formUtilities'
import { connect } from 'react-redux'
import { setSearch } from '../../../redux/actions'
import mapStateToSearch from './mapStateToSearch'

const OneStepper = ({ structure, state, show, search, setSearch, ...rest }) => {
  const formValid = () => multiStepFormValidGeneric(structure, 0, state)

  const updateSearch = () => mapStateToSearch(state, setSearch)

  const footer = () => (
    <Grid container justify="center">
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to={`/${show.next}`}
        disabled={!formValid()}
        size="large"
        onClick={updateSearch}
      >
        {show.submit || 'save'}
      </Button>
    </Grid>
  )

  return <Form {...{ structure, state, show, footer, step: 0, ...rest }} />
}

export default connect(
  ({ search }) => ({ search }),
  { setSearch }
)(OneStepper)
