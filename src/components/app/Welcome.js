import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Button from '@material-ui/core/Button'
import { Link } from 'react-router-dom'

import Logo from '../../images/Logo'
// import BuildData from '../utility/BuildData'

const useStyles = makeStyles(theme => ({
  page: {
    '@media (orientation: landscape)': {
      width: '100vh',
      height: '100vw',
    },
    '@media (orientation: portrait)': {
      width: '100vw',
      height: '100vh',
    },
  },
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
    fontFamily: 'sans-serif !important',
    height: '25%',
    fontSize: '6vmin',
    fontWeight: '300',
    textTransform: 'uppercase',
    letterSpacing: '0.4rem',
  },
  welcome2: {
    height: '50%',
  },
  welcome3: {
    height: '25%',
    display: 'flex',
    flexDirection: 'column',
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
    <div className={classes.page}>
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
          {/* <p>
            <BuildData />
          </p> */}
        </div>
      </div>
    </div>
  )
}

export default Welcome
