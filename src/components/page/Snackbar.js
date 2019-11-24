import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'

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
// Many times, it's easier to let useState handle a scalar rather than an and use as many of them as needed,
// otherwise, if you update only one variable at a time and don't know the value of (or don't want to update) the others,
// you must either use the functional form of setState or useReducer or even useImmerReducer..
// 'message' however is one of those cases where it actually makes more sense to define a multi-variable (i.e., object) state.

// ! Place configuration / unchanging function definitions outside the component
// Placing them here, outside of the component, ensures they won't affect the useEffect
// and is the only way to avoid eslint from demanding to include them in the list of useEffect dependencies.
// Including them in the list of useEffect dependencies will make it harder to see what that useEffect really depends on.

const reload = () => {
  console.log('reload invoked')
  window.location.reload(true)
}

const install = () => {
  navigator.serviceWorker.getRegistration().then(reg => {
    if (reg && reg.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' })
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
  },
  onlineMsg: {
    type: 'online',
    text:
      'Connection is on again! <br /><strong>Reload</strong> to see the latest offers.',
    action: 'Reload',
    invoke: reload,
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
}

export default function MySnackbar() {
  const device = useSelector(store => store.device)
  const { newerSwWaiting, contentCashed, online } = device

  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState({
    type: null,
    text: null,
    action: null,
    invoke: null,
  })

  const useStyles = makeStyles(theme => ({
    content: {
      flexWrap: 'nowrap',
    },
    close: {
      padding: theme.spacing(0.5),
      fontSize: '1.5rem',
    },
    icon: {
      marginRight: theme.spacing(1),
      fontSize: '1.5rem',
    },
    message: {
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
    },
    action: {
      textTransform: 'uppercase',
    },
  }))

  const classes = useStyles()

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
    }
  }, [contentCashed, newerSwWaiting, online, message])

  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={open}
        autoHideDuration={30000}
        onClose={handleClose}
        ContentProps={{
          'aria-describedby': 'message-id',
          className: classes.content,
        }}
        message={
          <div id="message-id" className={classes.message}>
            <InfoOutlinedIcon className={classes.icon} />
            <span dangerouslySetInnerHTML={{ __html: message.text }} />
          </div>
        }
        action={[
          message.action && (
            <Button
              key="undo"
              color="secondary"
              size="small"
              onClick={message.invoke}
            >
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