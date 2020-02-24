import React from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import { makeStyles } from '@material-ui/styles'

const Loader = ({ page }) => {
  const useStyles = makeStyles(theme => ({
    root: {
      height: page ? '100vh' : '100%',
      width: page ? '100vh' : '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
  }))

  const classes = useStyles()

  return (
    <div className={classes.root}>
      <CircularProgress />
    </div>
  )
}

export default Loader
