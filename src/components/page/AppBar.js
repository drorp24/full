import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setContextual, setShouldClose, toggleView } from '../../redux/actions'

import { makeStyles } from '@material-ui/styles'

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import IconButton from '@material-ui/core/IconButton'

import MenuIcon from '@material-ui/icons/Menu'
import Close from '@material-ui/icons/Close'
import Map from '@material-ui/icons/Map'
import ViewList from '@material-ui/icons/ViewList'

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 0,
    width: '100%',
  },
  appBar: {
    backgroundColor: contextualMenu =>
      contextualMenu ? 'black' : theme.palette.primary.main,
    height: '10vh',
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
    transform: contextualMenu => (contextualMenu ? 'rotate(90deg)' : 'initial'),
    transition: 'transform 0.3s',
  },
  view: {},
}))

const ButtonAppBar = ({ title }) => {
  const contextualMenu = useSelector(state => state.app.contextual)
  const name = useSelector(state => state.app.name)
  const view = useSelector(state => state.app.view)

  const classes = useStyles(contextualMenu)

  const dispatch = useDispatch()

  const setContextualMenu = useCallback(
    contextual => dispatch(setContextual(contextual)),
    [dispatch]
  )

  const setItemShouldClose = useCallback(
    should => dispatch(setShouldClose(should)),
    [dispatch]
  )

  const setViewToggle = useCallback(() => dispatch(toggleView()), [dispatch])
  const iconButtonClicked = () => {
    // Place here the menu logic
    if (contextualMenu) {
      setContextualMenu(false)
      setItemShouldClose(true)
    }
  }

  const viewClicked = () => {
    setViewToggle()
  }

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            className={classes.menuButton}
            color="inherit"
            aria-label="Menu"
            onClick={iconButtonClicked}
          >
            {contextualMenu ? <Close /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" color="inherit" className={classes.grow}>
            {name || title}
          </Typography>
          <Link to={view === 'list' ? '/map' : '/merchants'} color="inherit">
            <IconButton
              className={classes.view}
              color="inherit"
              onClick={viewClicked}
            >
              {view === 'map' ? <ViewList /> : <Map />}
            </IconButton>
          </Link>
        </Toolbar>
      </AppBar>
    </div>
  )
}

export default ButtonAppBar
