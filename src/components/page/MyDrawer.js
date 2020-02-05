import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { makeStyles } from '@material-ui/styles'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'

import Share from '@material-ui/icons/Share'
import Map from '@material-ui/icons/Map'
import Help from '@material-ui/icons/Help'
import ContactPhone from '@material-ui/icons/ContactPhone'
import MySvg from '../utility/svg'

import { ios } from '../utility/detect'
import share from './share'
import toggleMode from './toggleMode'
import { toggleLayout } from '../../redux/actions'

const MyDrawer = ({ drawerState, drawerDispatch }) => {
  const [isIos, setIsIos] = useState()
  useEffect(() => {
    setIsIos(ios())
  }, [])

  const dispatch = useDispatch()
  const mode = useSelector(store => store.device.mode)
  const otherMode = mode === 'light' ? 'dark' : 'light'
  const layout = useSelector(store => store.app.layout)
  const otherLayout = layout === 'vertical' ? 'horizontally' : 'vertically'
  const doNothing = () => {}

  // ! Passing components dynamically with an object
  // One way to pass a dynamic component is to have it in its JSX form as a value on some object's key
  // (Another which I use often is to simply assign a capitalized named variable to it then use the variable as the component)
  // used down below to pass a variable icon component (icon key)
  // ! Svg for variable icons
  // Specifically to icons, there's a better way to pass a dynamic icon, which is to use an svg icon
  // benefits:
  // - no need to import a component for every new item: with svg the icon is merely a name prop
  // - the icon can be context-sensitive (example, 'svg: otherMode')
  // - embedded rather than fetched (not as strong a reason, as chances are most MUI icons as svg,
  //   plus webpack automatically converts < 10k png's into svgs and embeds them)
  const menu = [
    {
      icon: <Share />,
      text: 'Share app',
      action: share(dispatch),
    },
    {
      svg: otherMode,
      text: `${otherMode} mode`,
      action: toggleMode({ mode, dispatch }),
    },
    {
      svg: otherLayout,
      text: `Slide ${otherLayout}`,
      redux: toggleLayout(),
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
      fontSize: '8vmin',
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
    listItemText: {
      textTransform: 'capitalize',
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
          {menu.map(({ icon, svg, text, action, redux }) => (
            <ListItem
              button
              key={text}
              className={classes.listItem}
              onClick={
                redux
                  ? () => {
                      dispatch(redux)
                    }
                  : action
              }
            >
              <ListItemIcon>
                <>
                  {icon}
                  {svg && <MySvg icon={svg} />}
                </>
              </ListItemIcon>
              <ListItemText className={classes.listItemText} disableTypography>
                {text}
              </ListItemText>
            </ListItem>
          ))}
        </List>
      </div>
    </SwipeableDrawer>
  )
}

export default MyDrawer
