import React, { useEffect, useState, useContext, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

import { setA2hs } from '../../redux/actions'

export default function A2HSPrompt() {
  let nativeInstall = useContext(store => store.device.nativeInstall)

  const [show, setShow] = useState(false)

  const a2hs = useSelector(store => store.user.a2hs)
  const { prompted, accepted } = a2hs

  const oneHour = 1000 * 60 * 60
  const now = useCallback(() => new Date(), []) // useCallback isn't really caching anything in this case...
  const timePrompted = () => prompted && Date.parse(prompted) // redux stores dates as strings
  const recently_prompted = now() - timePrompted() < oneHour

  const dispatch = useDispatch()
  const recordAccepted = useCallback(
    type => {
      console.log(`User has accepted the ${type} prompt`)
      dispatch(setA2hs({ prompted: now(), accepted: true }))
    },
    [dispatch, now]
  )
  const recordDismissed = useCallback(
    type => {
      console.log(`User has dismissed the ${type} prompt`)
      dispatch(setA2hs({ prompted: now(), accepted: false }))
    },
    [dispatch, now]
  )

  const handleClose = () => {
    setShow(false)
    recordDismissed('homemade')
  }
  const handleDismissed = () => {
    console.log('User dismissed the homemade A2HS prompt')
    setShow(false)
    recordDismissed('homemade')
  }
  const handleAccepted = () => {
    console.log('User accepted the homemade A2HS prompt')
    setShow(false)
    recordAccepted('homemade')
  }

  useEffect(() => {
    if (accepted || recently_prompted) {
      console.log('a2hs accepted or recently prompted. Not asking again')
      return
    }

    const prompt = () => {
      if (nativeInstall) {
        nativeInstall.prompt()
        nativeInstall.userChoice.then(choiceResult => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the native A2HS prompt')
            recordAccepted('native')
          } else {
            console.log('User dismissed the native A2HS prompt')
            recordDismissed('native')
          }
        })
      } else {
        setShow(true)
      }
    }
    setTimeout(prompt, 3000)
  }, [
    a2hs,
    accepted,
    dispatch,
    nativeInstall,
    now,
    recently_prompted,
    recordAccepted,
    recordDismissed,
  ])

  // Customize this as needed
  const HomemadePrompt = ({ show }) => (
    <Dialog
      open={show}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Add to homescreen</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Click 'Share' then 'Add to Homescreen' to get our service faster!
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDismissed} color="primary">
          Maybe next time
        </Button>
        <Button onClick={handleAccepted} color="primary" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  )

  return <HomemadePrompt {...{ show }} />
}
