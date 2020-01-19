import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Button from '@material-ui/core/Button'
import { Link } from 'react-router-dom'
import Page from '../page/Page'

import Logo from '../../images/Logo'

const useStyles = makeStyles(theme => ({
  welcomeContainer: {
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    width: '100%',
    height: '100%',
  },
  welcomeSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcome1: {
    height: '25%',
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
    fontSize: '5vmin',
    fontWeight: '300',
  },
  welcome2: {
    height: '50%',
  },
  welcome3: {
    height: '25%',
  },
  welcomeImg: {
    width: '50%',
  },
  button: {
    fontFamily: 'sans-serif !important',
  },
}))

// ! Navigation buttons
// In their Button documentation, material-ui mention 'href' as the prop to use for navigation
// This is good for external links only, and very bad for internal ones, as it will call the server!
// Instead, use component={Link} with to="..." to navigate with React router.
// Same thing with the navigation button on OneStepper.js

const Welcome = () => {
  const classes = useStyles()

  return (
    <Page noAppBar>
      <div className={classes.welcomeContainer}>
        <div className={`${classes.welcome1} ${classes.welcomeSection}`}>
          Cryptonite
        </div>
        <div className={`${classes.welcome2} ${classes.welcomeSection}`}>
          <div className={classes.welcomeImg}>
            <Logo />
          </div>
        </div>
        <div className={`${classes.welcome3} ${classes.welcomeSection}`}>
          <Button
            variant="outlined"
            color="inherit"
            component={Link}
            to="/select"
            className={classes.button}
          >
            Click to Start
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default Welcome
