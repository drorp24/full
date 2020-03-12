import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setValue, setUser, setDevice } from '../../redux/actions'
import { useLocation } from 'react-router-dom'

import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import MySvg from '../utility/svg'
import clsx from 'clsx'
import recentlyNotified from '../utility/recentlyNotified'

// ! Informing user of events using snackbars
//
// Events are imperative by nature but communicated via Snackbars which are declarative, being React components.
// All events worth notifying the user are recorded some place "everyone can see" (redux in my case) and communicated via the <Snackbar />
// which is included on every page and reacts to changes in that global space thus showing the proper messages.
//
// * Fading out messages vs. self-removing actions
// Even though snackbars can be configured to fade themselves out after some time,
// I let some events remove themselves from the redux store after some time.
//
// This mechanism was required to force some messages to recurr periodically, in spite of the state itself remaining intact.
// If the states had remained on in redux, even though the snackbar messages would have faded away,
// the remained redux status would have hindered other events from being evaluated, effectively blocking them from rendering.
// (they would remain true in the useEffect and so would be the one displayed even if the useEffect had been trigger by another event).
//
// Examples for such constant statuses that were made into recurring events:
// - periodical reminder for the user to intall a newer pending release
// - periodical add to home screen prompt
//
// ! Use multi-variable state (only) when it makes sense
// Many times, it's easier to let useState handle a scalar rather than an object and use as many of them as needed,
// otherwise, if you update only one variable at a time and don't know the value of (or don't want to update) the others,
// you must either use the functional form of setState or useReducer or even useImmerReducer.
// 'message' however is one of those cases where it actually makes more sense to define a multi-variable (i.e., object) state.

const reload = () => {
  console.log('reload invoked')
  window.location.reload(true)
}

// ! Installing a new release
// Documented in 'Snackbar.js'
// TODO: 'install' function of course should not be defined here
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

const install = dispatch => () => {
  navigator.serviceWorker.getRegistration().then(reg => {
    if (reg && reg.waiting) {
      function reloadPage() {
        window.location.reload()
      }

      dispatch(
        setValue({ type: 'SET_DEVICE', key: 'newerSwWaiting', value: false })
      )

      reg.waiting.postMessage({ type: 'SKIP_WAITING' })
      // SKIP_WAITING takes time:
      // 'controllerchange' is the event sw emits once it's finished updating its cache with the new files
      // only then should the page be reloaded
      navigator.serviceWorker.addEventListener('controllerchange', reloadPage)
    }
  })
}

export default function MySnackbar() {
  const device = useSelector(store => store.device)
  const { newerSwWaiting, contentCached, online, appShared } = device
  const orientation =
    typeof window !== 'undefined'
      ? window.matchMedia('(orientation: portrait)').matches
        ? 'portrait'
        : 'landscape'
      : 'portrait'

  const { offline } = useSelector(store => store.user)
  const recentlyNotifiedOffline = recentlyNotified(offline)

  const [open, setOpen] = useState(false)

  const [message, setMessage] = useState({
    type: null,
    text: null,
    action: null,
    invoke: null,
  })

  const { pathname } = useLocation()

  const dispatch = useDispatch()

  const useStyles = makeStyles(theme => ({
    root: {
      // This hack ensures full width when device rotates since MUI use px for snackbar margins ($#!)
      '@media (orientation: landscape)': {
        width: 'calc(100vh - 48px)',
      },
      '@media (orientation: portrait)': {
        width: 'unset',
      },

      // This ensures snackbars would show above bottom FAB (MD rules)
      bottom: pathname === '/select' ? '11%' : '8px',
    },
    content: {
      flexWrap: 'nowrap',
      '@media (orientation: landscape)': {
        width: '100%',
      },
      '@media (orientation: portrait)': {
        width: 'unset',
      },
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
      color: '#00c853',
    },
    success: {
      color: '#00c853',
    },
    warning: {
      color: 'orange',
    },
    error: {
      color: 'red',
    },
  }))

  const classes = useStyles()

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  // ! When it is okay to both read and write state in a useEffect
  // Similalry to how I ask whether I set already the values in FormContainer's useEffects,
  // here is another case that justifies both reading and writing state in the same useEffect:
  //
  //  It would be absurd to notify a user that he's online, unless a prior msg informed him he was offline;
  //  Similarly, it would be senseless to notify user he's in prtrait, unless I just notified him he was in landscape mode.
  //
  //  Since I'm both reading and writing to landscapeNotified state, I'm paying the very small penalty of entering the useEffect twice:
  //  - once that it would anyway enter for each state change (landscape to portrait and vice versa)
  //  - and then another time for my own flag state change.
  //  I could of course work around that (e.g. by creating 2 separate useEffects), but it wouldn't justify a bad code.
  //
  // ! When is redux preferrable to local state
  // Local state would not survive a page reload. For the landscape orientation notification I don't care,
  // but I do want the offline notification timing to survive a page reload, or else I wouldn't get a 'connection is on again'
  // notification after a page reload that is followed by connection return. And since a page reload is the ultimate
  // demonstration that app functions in offline, it would mean missing the 'connection is on' entirely.
  // So for offline notification timing I'm using redux rather than local state.
  //
  // Using redux doesn't mean not paying the price of entering one more time into the useEffect,
  // which is the result of mutating a dependency, regardless of where it is stored.

  const [landscapeNotified, setLandscapeNotified] = useState()

  useEffect(() => {
    const messages = {
      offlineMsg: {
        type: 'offline',
        text:
          'Connection lost, but no worries: <br/><strong>you can browse offline!</strong>',
        action: null,
        invoke: () => {},
        icon: 'cloudOff',
        level: 'warning',
        duration: 10000,
      },
      onlineMsg: {
        type: 'online',
        text: 'Connection is on! <br /><strong>Reload</strong> to view offers',
        action: 'Reload',
        invoke: reload,
        icon: 'cloudOn',
        level: 'success',
        duration: 15000,
      },
      newerSwWaitingMsg: {
        type: 'newerSwWaiting',
        text: 'New release arrived! Install it?',
        action: 'Install',
        invoke: install(dispatch),
        icon: 'newRelease',
      },
      contentCachedMsg: {
        type: 'contentCached',
        text: 'Our app is fully cached. This means you can use it offline!',
        action: '',
        invoke: () => {},
        icon: 'cloudOn',
      },
      appSharedMsg: {
        type: 'appShared',
        text: 'Thanks for sharing Cryptonite!',
        action: '',
        invoke: () => {},
        icon: 'sharing',
        level: 'success',
        duration: 3000,
      },
      appNotSharedMsg: {
        type: 'appNotShared',
        text: 'Sorry, this device does not support sharing.',
        action: '',
        invoke: () => {},
        icon: 'sad',
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

    const {
      offlineMsg,
      onlineMsg,
      newerSwWaitingMsg,
      contentCachedMsg,
      appSharedMsg,
      appNotSharedMsg,
      landscapeMsg,
    } = messages

    if (orientation === 'landscape') {
      setLandscapeNotified(true)
      setOpen(true)
      setMessage(landscapeMsg)
    } else if (orientation === 'portrait' && landscapeNotified) {
      setLandscapeNotified(false)
      setOpen(false)
    } else if (online === false && !recentlyNotifiedOffline) {
      dispatch(setUser({ offline: new Date() }))
      setOpen(true)
      setMessage(offlineMsg)
    } else if (online && recentlyNotifiedOffline) {
      dispatch(setUser({ offline: null }))
      setOpen(true)
      setMessage(onlineMsg)
    } else if (newerSwWaiting) {
      setOpen(true)
      setMessage(newerSwWaitingMsg)
    } else if (contentCached) {
      dispatch(setDevice({ contentCached: false }))
      setOpen(true)
      setMessage(contentCachedMsg)
    } else if (appShared) {
      setOpen(true)
      setMessage(appSharedMsg)
    } else if (appShared === false) {
      setOpen(true)
      setMessage(appNotSharedMsg)
    }
  }, [
    online,
    dispatch,
    newerSwWaiting,
    contentCached,
    appShared,
    orientation,
    landscapeNotified,
    offline,
    recentlyNotifiedOffline,
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
