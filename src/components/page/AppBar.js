import React from 'react'
import { useSelector } from 'react-redux'

import { makeStyles } from '@material-ui/styles'

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles({
  root: {
    flexGrow: 0,
    width: '100%',
  },
  appBar: {
    height: fullscreen => (fullscreen ? 0 : '10vh'),
    transition: 'height 1s',
  },
  toolbar: {
    height: '100%',
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
})

const ButtonAppBar = ({ title }) => {
  const fullscreen = useSelector(state => state.app.fullscreen)
  const classes = useStyles(fullscreen)

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography
            variant="h6"
            color="inherit"
            className={classes.grow}
            style={{ textAlign: 'center' }}
          >
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  )
}

export default ButtonAppBar
