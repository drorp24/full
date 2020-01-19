import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'

import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import defined from '../utility/defined'
import MySvg from '../utility/svg'
import clsx from 'clsx'

// ! Informing user of events using snackbars
//
// Events are imperative by nature but communicated via Snackbars which are declarative, being React components.
// All events worth notifying the user are recorded some place "everyone can see" (redux in my case) and communicated via the <Snackbar />
// which is included on every page and reacts to changes in that global space thus showing the proper messages.
//
// * Fading out messages vs. self-removing actions
// Even though messages can fade out after some time, some events remove themselves from the redux store after some time.
// This happens if the actual state doesn't change, but we want to set it to recur periodically.
// If those events had remained on, they would hinder other events from being evaluated hence displayed to the user
// (they would remain true in the useEffect and so would be the one displayed even if the useEffect had been trigger by another event).
// Examples: reminding the user to intall a newer pending release or create a shortcut
// - both of which I made to recur every page reload and app visit.
//
// ! Use multi-variable state (only) when it makes sense
// Many times, it's easier to let useState handle a scalar rather than an object and use as many of them as needed,
// otherwise, if you update only one variable at a time and don't know the value of (or don't want to update) the others,
// you must either use the functional form of setState or useReducer or even useImmerReducer.
// 'message' however is one of those cases where it actually makes more sense to define a multi-variable (i.e., object) state.

// ! Place configuration / unchanging function definitions outside the component
// Placing them here, outside of the component, ensures they won't affect the useEffect
// and is the only way to avoid eslint from demanding to include them in the list of useEffect dependencies.
// Including them in the list of useEffect dependencies will make it harder to see what that useEffect really depends on.

const reload = () => {
  console.log('reload invoked')
  window.location.reload(true)
}

// ! Installing a new release
// Documented in 'Snackbar.js'
//
// ? Install the new release for the user
// If the 'registration' object which is available only as a return of a promise isn't peculiar enough,
// and the notion that it is the registration's s/w which has to "skipWaiting"
// (rather than the active service-worker resigning or some controller above the two replacing) is not weird enough,
// we have to use 'postMessage' to convey the message to the active s/w, instead of talking to some controller.
//
// Worse yet, I don't have access to the service-worker.js code.
//
// Since CRA implements Workbox that generates the service-worker code in CRA apps,
// I am sending the message that the service-worker.js code generated by Workbox expects and reacts to ({type: 'SKIP_WAITING'})
// Luckily, it works.
// No mention of that challenge anywhere!
//
// ? Await the control change to reload and fetch the new release
// The process of changing control is asyc (and from my experience really takes some time to finish)
// so we need to wait till 'controllerchange' event is fired before we can reload the page.
//
// As I discovered the hard way (not documented of course), 'controllerchange' is fired at initial s/w registration *as well*,
// so when I placed that event listener somewhere else, it made the page reload twice every time I reloaded.
// By putting the addEventListener here, it is only once user has clicked 'Install' that the event is defined.
//
// No need for removeEventListener: as soon as the page reloads, all events will have been forgotten.

const install = () => {
  navigator.serviceWorker.getRegistration().then(reg => {
    if (reg && reg.waiting) {
      function reloadPage() {
        console.log(
          'controllerchange: skipWaiting has completed - reloading...'
        )
        window.location.reload()
      }
      reg.waiting.postMessage({ type: 'SKIP_WAITING' })
      navigator.serviceWorker.addEventListener('controllerchange', reloadPage)
    }
  })
}

const messages = {
  offlineMsg: {
    type: 'offline',
    text:
      'Connection is lost, but no worries: <br/><strong>you can use the app offline!</strong>',
    action: null,
    invoke: () => {},
    icon: 'cloudOff',
    level: 'warning',
    duration: 10000,
  },
  onlineMsg: {
    type: 'online',
    text:
      'Connection is on! <br /><strong>Reload</strong> to view latest offers',
    action: 'Reload',
    invoke: reload,
    icon: 'cloudOn',
    level: 'success',
    duration: 15000,
  },
  newerSwWaitingMsg: {
    type: 'newerSwWaiting',
    text: 'New release ready. Install?',
    action: 'Install',
    invoke: install,
  },
  contentCashedMsg: {
    type: 'contentCached',
    text: 'Our app can now work offline!',
    action: '',
    invoke: () => {},
  },
  appSharedMsg: {
    type: 'appShared',
    text: 'Thanks for sharing Cryptonite!',
    action: '',
    invoke: () => {},
    icon: 'check',
    level: 'success',
    duration: 3000,
  },
  appNotSharedMsg: {
    type: 'appNotShared',
    text: 'This device does not support sharing',
    action: '',
    invoke: () => {},
    icon: 'warning',
    level: 'warning',
    duration: 3000,
  },
  landscapeMsg: {
    type: 'landscape',
    text: 'Please rotate!',
    action: '',
    invoke: () => {},
    icon: 'rotate',
    level: 'warning',
    duration: 30000,
  },
}

export default function MySnackbar() {
  const device = useSelector(store => store.device)
  const {
    newerSwWaiting,
    contentCashed,
    online,
    appShared,
    orientation,
  } = device

  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState({
    type: null,
    text: null,
    action: null,
    invoke: null,
  })

  const { pathname } = useLocation()

  const useStyles = makeStyles(theme => ({
    root: {
      // hack to maintain full width when body auto rotates in response to device orientation change
      width: ({ orientation }) =>
        orientation === 'landscape' ? 'calc(100vh - 48px)' : 'unset',
      // by MD rules, snackbars should show above FABs
      bottom: pathname === '/select' ? '11%' : '8px',
    },
    content: {
      flexWrap: 'nowrap',
      width: ({ orientation }) =>
        orientation === 'landscape' ? '100%' : 'unset',
    },
    close: {
      padding: theme.spacing(0.5),
      fontSize: '1.5rem',
    },
    icon: {
      marginRight: theme.spacing(2),
      fontSize: '1.5rem',
    },
    message: {
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
    },
    action: {
      textTransform: 'uppercase',
      color: '#90ee90',
    },
    success: {
      color: '#90ee90',
    },
    warning: {
      color: 'orange',
    },
    error: {
      color: 'red',
    },
  }))

  const classes = useStyles({ orientation })

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  useEffect(() => {
    const { type } = message
    const {
      offlineMsg,
      onlineMsg,
      newerSwWaitingMsg,
      contentCashedMsg,
      appSharedMsg,
      appNotSharedMsg,
      landscapeMsg,
    } = messages

    if (!online) {
      setOpen(true)
      setMessage(offlineMsg)
    } else if (online && type === 'offline') {
      setOpen(true)
      setMessage(onlineMsg)
    } else if (newerSwWaiting) {
      setOpen(true)
      setMessage(newerSwWaitingMsg)
    } else if (contentCashed) {
      setOpen(true)
      setMessage(contentCashedMsg)
    } else if (defined(appShared) && appShared) {
      setOpen(true)
      setMessage(appSharedMsg)
    } else if (defined(appShared) && !appShared) {
      setOpen(true)
      setMessage(appNotSharedMsg)
    } else if (orientation === 'landscape') {
      setOpen(true)
      setMessage(landscapeMsg)
    } else if (
      orientation === 'portrait' &&
      message.type === 'landscape' &&
      open
    ) {
      setOpen(false)
    }
  }, [
    contentCashed,
    newerSwWaiting,
    online,
    message,
    appShared,
    orientation,
    open,
  ])

  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        className={classes.root}
        open={open}
        autoHideDuration={message.duration || 10000}
        onClose={handleClose}
        ContentProps={{
          'aria-describedby': 'message-id',
          className: classes.content,
        }}
        message={
          <div id="message-id" className={classes.message}>
            <MySvg
              icon={message.icon || 'info'}
              className={clsx(
                classes[message.level || 'success'],
                classes.icon
              )}
            />
            <span dangerouslySetInnerHTML={{ __html: message.text }} />
          </div>
        }
        action={[
          message.action && (
            <Button key="undo" size="small" onClick={message.invoke}>
              <span className={classes.action}>{message.action}</span>
            </Button>
          ),
          <IconButton
            key="close"
            aria-label="close"
            color="inherit"
            className={classes.close}
            onClick={handleClose}
          >
            <CloseIcon />
          </IconButton>,
        ]}
      />
    </div>
  )
}
