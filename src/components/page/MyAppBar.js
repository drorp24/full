import React, { useCallback, useReducer } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setContextual, setShouldClose } from '../../redux/actions'

import { makeStyles } from '@material-ui/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'

import Close from '@material-ui/icons/Close'
import CloudOff from '@material-ui/icons/CloudOff'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import MySvg from '../utility/svg'
import MyDrawer from './MyDrawer'
import toggleMode from './toggleMode'

import { inBrowser } from '../utility/detect'

// ! Mystery: MyAppBar gets re-rendered whenever either of the form values gets updated
// That's 3 times plus 1 for each location tracking attempt.
// It makes no sense as none of MyAppBar's 8 hooks needs to change following those updates.
// But that still happens, and Profile tab shows it clearly, without of course disclosing which of the hooks changed.

// ! useStyles' argument must be an object
// useStyles hook can receive a variable as an optional argument, which can then be used
// in a function that calculates the style according to it.
// In Merchant, I'm passing the Merchant's state to have its content a function of whether it is 'open' or not
// Here, I'm passing the redux selector 'contextualMenu' so the background color is a function of whether the state is contextual or not.
// In Merchant.js, 'state' is an object. But 'contextualMenu' is not.
// Aparently, it's essential to pass an obj into useStyles or else MUI will log a (misleading) 'missing prop' error.
//
const MyAppBar = ({ title, icon = null, noBack }) => {
  const onServer = !inBrowser()
  const { name, contextual } = useSelector(state => state.app)
  const { online, mode } = useSelector(store => store.device)
  const otherMode = mode === 'light' ? 'dark' : 'light'
  const standalone = useMediaQuery('(display-mode: standalone) ')

  const useStyles = makeStyles(theme => ({
    root: {
      width: '100%',
    },
    appBar: {
      height: '100%',
      boxShadow: 'inherit',
      paddingTop: standalone ? '10%' : 0,

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
      padding: '0',
    },
    pageIcon: {
      display: 'none',
      marginRight: '1rem',
    },
    centerPart: {
      display: 'flex',
      justifyContent: 'space-evenly', // title will move when offline icons shows up, but will be centered
      alignItems: 'center',
      flexWrap: 'nowrap',
    },
    name: {
      fontWeight: '400',
      textTransform: 'capitalize',
    },
    backButton: {
      transform: contextual ? 'rotate(90deg)' : 'initial',
      transition: 'transform 0.3s',
    },
    extended: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
  }))

  const classes = useStyles()

  const dispatch = useDispatch()

  const setContextualMenu = useCallback(
    contextual => dispatch(setContextual(contextual)),
    [dispatch]
  )

  const setItemShouldClose = useCallback(
    should => dispatch(setShouldClose(should)),
    [dispatch]
  )

  let history = useHistory()

  const closeClicked = () => {
    setContextualMenu(false)
    setItemShouldClose(true)
  }

  const backClicked = () => {
    history.goBack()
  }

  // ! useReducer is better than useState when a reducer has to be passed down to a child
  // The Menu icon is part of the MyAppBar component;
  // when it is clicked, it should affect MyDrawer's state so that MyDrawer will re-render;
  // The menu items on the other hand are part of the MyDrawer component;
  // when they are clicked, they should also affect MyDrawer's state in the same way to make it re-render (close in this case).
  //
  // MyDrawer has a property ('open') which, when changed, make it re-render, i.e., open or close.
  // That state should be able to be managed by MyDrawer locally, and also be dictated by the parent.
  // In addition, internal state changes should be reported up to the parent (to be able to toggle, in this case).
  // All this means that MyDrawer's state needs to be controlled by its parent.
  //
  // Instead of usingState and sending the setWhatever as a prop to the child,
  // it's preferrable to pass a dispatch function to the child, the one returned by calling useReducer.
  //
  // The main reason:
  // if the state is anyway controlled by the parent, the logic to update it better be left to the parent only.
  // Passing a reducer function means the child doesn't know the logic to do the update;
  // instead, it merely sets up a 'type', specifying what should be done rather than how.
  // The logic is right here, in 'drawerReducer':

  function drawerReducer(state, { type }) {
    switch (type) {
      case 'open':
        return true
      case 'close':
        return false
      case 'toggle':
        return !state
      default:
        throw new Error()
    }
  }

  const [drawerState, drawerDispatch] = useReducer(drawerReducer, false)

  const doNothing = () => {}
  const ShowNothing = () => <></>
  const svgIcon = icon => () => <MySvg {...{ icon }} />
  const menuClicked = () => {
    drawerDispatch({ type: 'toggle' })
  }

  let LeftIcon, leftClickHandler
  if (contextual) {
    LeftIcon = Close
    leftClickHandler = closeClicked
  } else if (!noBack) {
    LeftIcon = ArrowBackIcon
    leftClickHandler = backClicked
  } else {
    LeftIcon = MenuIcon
    leftClickHandler = menuClicked
  }

  let RightIcon, rightClickHandler
  if (contextual) {
    RightIcon = ShowNothing
    rightClickHandler = doNothing
  } else if (noBack) {
    RightIcon = svgIcon(otherMode)
    rightClickHandler = toggleMode({ mode, dispatch })
  } else {
    RightIcon = svgIcon('more')
    rightClickHandler = menuClicked
  }

  return (
    <AppBar position="static" className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        <IconButton
          className={classes.backButton}
          color="inherit"
          onClick={leftClickHandler}
          disableRipple={true}
        >
          <LeftIcon />
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
          <CloudOff
            style={{ display: online || onServer ? 'none' : 'inline' }}
          />
        </div>

        <IconButton color="inherit" onClick={rightClickHandler}>
          <RightIcon />
        </IconButton>
      </Toolbar>
      <MyDrawer {...{ drawerState, drawerDispatch }} />
    </AppBar>
  )
}

export default MyAppBar
