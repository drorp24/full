import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { makeStyles } from '@material-ui/styles'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'

import Share from '@material-ui/icons/Share'
import DarkMode from '@material-ui/icons/Brightness4'
import Map from '@material-ui/icons/Map'
import Help from '@material-ui/icons/Help'
import ContactPhone from '@material-ui/icons/ContactPhone'

import { ios } from '../utility/detect'
import share from './share'

const MyDrawer = ({ drawerState, drawerDispatch }) => {
  const [isIos, setIsIos] = useState()
  useEffect(() => {
    setIsIos(ios())
  }, [])

  const dispatch = useDispatch()

  const doNothing = () => {}

  // ! Passing components dynamically with an object
  const menu = [
    {
      icon: <Share />,
      text: 'Share app',
      action: share(dispatch),
    },
    {
      icon: <DarkMode />,
      text: 'Dark mode',
      action: doNothing,
    },
    {
      icon: <Map />,
      text: 'Map view',
      action: doNothing,
    },
    {
      icon: <ContactPhone />,
      text: 'Contact us',
      action: doNothing,
    },
    {
      icon: <Help />,
      text: 'Help',
      action: doNothing,
    },
  ]

  const drawer = action => event => {
    if (
      event &&
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    )
      return

    drawerDispatch({ type: action })
  }

  const useStyles = makeStyles(theme => ({
    drawer: {
      height: '100%',
      minWidth: '80vw',
      display: 'grid',
      gridTemplateRows: '10% auto',
    },
    header: {
      paddingLeft: '1.5rem',
      fontSize: '1.5em',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: '#888',
      color: 'white',
      fontWeight: '300',
    },
    list: {
      paddingLeft: '1.5rem',
    },
    listItem: {
      paddingLeft: '0',
      height: '15%',
      fontSize: '1.15rem',
    },
  }))

  const classes = useStyles()

  return (
    <SwipeableDrawer
      open={drawerState}
      onClose={drawer('close')}
      onOpen={drawer('open')}
      disableBackdropTransition={!isIos}
      disableDiscovery={isIos}
      id="swipeableDrawer"
    >
      <div
        role="presentation"
        onClick={drawer('close')}
        onKeyDown={drawer('close')}
        id="drawer"
        className={classes.drawer}
      >
        <div className={classes.header}>Cryptonite</div>
        <List className={classes.list}>
          {menu.map(({ icon, text, action }) => (
            <ListItem
              button
              key={text}
              className={classes.listItem}
              onClick={action}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText disableTypography>{text}</ListItemText>
            </ListItem>
          ))}
        </List>
      </div>
    </SwipeableDrawer>
  )
}

export default MyDrawer
