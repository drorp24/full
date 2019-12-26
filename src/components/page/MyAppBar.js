import React, { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setContextual, setShouldClose, toggleView } from '../../redux/actions'

import { makeStyles } from '@material-ui/styles'

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import IconButton from '@material-ui/core/IconButton'

import Close from '@material-ui/icons/Close'
import Map from '@material-ui/icons/Map'
import ViewList from '@material-ui/icons/ViewList'
import CloudOff from '@material-ui/icons/CloudOff'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import MySvg from '../utility/svg'

import { inBrowser } from '../utility/detect'

// ! useStyles' argument must be an object
// useStyles hook can receive a variable as an optional argument, which can then be used
// in a function that calculates the style according to it.
// In Merchant, I'm passing the Merchant's state to have its content a function of whether it is 'open' or not
// Here, I'm passing the redux selector 'contextualMenu' so the background color is a function of whether the state is contextual or not.
// In Merchant.js, 'state' is an object. But 'contextualMenu' is not.
// Aparently, it's essential to pass an obj into useStyles or else MUI will log a (misleading) 'missing prop' error.
const MyAppBar = ({ title, icon = null, noBack }) => {
  const useStyles = makeStyles(theme => ({
    root: {
      width: '100%',
    },
    appBar: {
      height: '100%',
      backgroundColor: ({ contextualMenu }) =>
        contextualMenu
          ? theme.palette.primary.contextual
          : 'theme.palette.primary.main',
      // ! The problem with 'vh' unit in mobile browsers
      // 100vh assumes the mobile browser's address bar is minimal (as occurs after scrolling beyond the first page)
      // hence isn't good for the first (and only in my case) page: it makes 100vh longer than the viewport actual height
      // (which is the page's entire height minus the height of the browser chrome)
      // attempting to use innerHeight home-made as in the following commented line did *not* solve the problem:
      // aparently, innerHeight changes each time another form line is populated (found nothing about it)
      // (some times not symetrically!)
      // only when replaced the home-made line below to using <Div100vh style={{ height: '10rvh' }} /> did it maintain an exact 10% height AppBar!
      // height: typeof window === 'object' ? window.innerHeight * 0.1 : '10vh', // see 'using innerHeight instead of vh units in Merchant.js
      // height: '100%',
    },
    toolbar: {
      height: '100%',
      display: 'grid',
      gridTemplateColumns: '20% 60% 20%', // auto would leave the centerpart with no defined width, which prevents ellipsis
      // gridColumnGap: '10px', // don't use it: it's not done symmetrically
      padding: '0',
    },
    pageIcon: {
      display: 'none',
      marginRight: '1rem',
    },
    centerPart: {
      display: 'flex',
      // justifyContent: 'flex-start', // title won't move when offline icon shows up
      justifyContent: 'space-evenly', // title will move when offline icons shows up, but will be centered
      alignItems: 'center',
      flexWrap: 'nowrap',
    },
    name: {
      fontWeight: '400',
    },
    backButton: {
      transform: ({ contextualMenu }) =>
        contextualMenu ? 'rotate(90deg)' : 'initial',
      transition: 'transform 0.3s',
    },
    viewMode: {
      // visibility: 'hidden',
    },
    link: {
      textAlign: 'center',
    },
  }))

  const name = useSelector(state => state.app.name)
  const view = useSelector(state => state.app.view)
  const contextualMenu = useSelector(state => state.app.contextual)
  const deviceIsOnline = useSelector(state => state.device.online)
  const onServer = !inBrowser()
  const online = deviceIsOnline || onServer

  const classes = useStyles({ contextualMenu })

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

  let history = useHistory()

  const backButtonClicked = () => {
    if (contextualMenu) {
      setContextualMenu(false)
      setItemShouldClose(true)
    } else {
      history.goBack()
    }
  }

  const viewClicked = () => {
    setViewToggle()
  }

  return (
    <AppBar position="static" className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        <IconButton
          className={classes.backButton}
          color="inherit"
          onClick={backButtonClicked}
        >
          {contextualMenu ? (
            <Close />
          ) : (
            <ArrowBackIcon
              style={{ visibility: noBack ? 'hidden' : 'visible' }}
            />
          )}
        </IconButton>
        <div className={classes.centerPart}>
          <MySvg icon={icon} className={classes.pageIcon} />
          <Typography
            variant="h6"
            color="inherit"
            noWrap
            className={classes.name}
          >
            {name || title}
          </Typography>
          <CloudOff style={{ display: online ? 'none' : 'inline' }} />
        </div>
        <Link
          to={view === 'list' ? '/map' : '/merchants'}
          color="inherit"
          className={classes.link}
        >
          <IconButton
            className={classes.viewMode}
            color="inherit"
            onClick={viewClicked}
          >
            {view === 'map' ? <ViewList /> : <Map />}
          </IconButton>
        </Link>
      </Toolbar>
    </AppBar>
  )
}

export default MyAppBar
