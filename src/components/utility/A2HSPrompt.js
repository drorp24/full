import React, { useEffect, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { makeStyles } from '@material-ui/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

import { setA2hs } from '../../redux/actions'

import iosShare from '../../assets/images/iosShare.png'
import icon from '../../assets/images/apple-icon-120.png'
import recentlyNotified from './recentlyNotified'

export default function A2HSPrompt() {
  let { online, nativeInstall } = useSelector(store => store.device)
  const offline = !online

  const [show, setShow] = useState(false)

  const { a2hs } = useSelector(store => store.user)
  const { ios, orientation } = useSelector(store => store.device)
  const landscape = orientation === 'landscape'

  const { prompted, accepted } = a2hs
  const recently_prompted = recentlyNotified(prompted)

  const dispatch = useDispatch()
  const recordAccepted = useCallback(
    type => {
      console.log(`User has accepted the ${type} prompt`)
      dispatch(setA2hs({ prompted: new Date(), accepted: true }))
    },
    [dispatch]
  )
  const recordDismissed = useCallback(
    type => {
      console.log(`User has dismissed the ${type} prompt`)
      dispatch(setA2hs({ prompted: new Date(), accepted: false }))
    },
    [dispatch]
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
    const reasonsNotToPrompt = {
      accepted,
      recently_prompted,
      offline,
    }
    if (Object.values(reasonsNotToPrompt).includes(true)) {
      console.log(
        'No a2hs prompt since at least one of the following is true:',
        reasonsNotToPrompt
      )
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
    setTimeout(prompt, 10000)
  }, [
    a2hs,
    accepted,
    dispatch,
    landscape,
    nativeInstall,
    offline,
    recently_prompted,
    recordAccepted,
    recordDismissed,
  ])

  // Customize this as needed
  const HomemadePrompt = ({ show }) => {
    const overrideToMatchIcon = {
      backgroundColor: '#f8f8f8',
      color: '#555',
    }
    const useStyles = makeStyles(theme => ({
      container: {
        width: landscape ? '100vh' : 'unset',
      },
      background: {
        backgroundColor: overrideToMatchIcon.backgroundColor,
        color: overrideToMatchIcon.color,
      },
      appMarketing: {
        display: 'grid',
        gridTemplateColumns: '8vmax auto',
        columnGap: '1em',
        alignItems: 'center',
        fontSize: '4.5vmin',
      },
      url: {
        color: '#888',
        fontSize: '4vmin',
        fontWeight: '300',
      },
      instructions: {
        fontSize: '4vmin',
        marginTop: '3vmax',
        color: overrideToMatchIcon.color,
      },
      appIcon: {
        height: '13vmin',
        borderRadius: '7px',
      },
      iosIcon: {
        width: '1.8em',
      },
    }))

    const classes = useStyles()

    return (
      <Dialog
        open={show}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className={classes.container}
      >
        <DialogTitle id="alert-dialog-title" className={classes.background}>
          Install Cryptonite
        </DialogTitle>

        <DialogContent className={classes.background}>
          <div className={classes.appMarketing}>
            <img src={icon} alt="icon" className={classes.appIcon}></img>
            <div>
              <div>Best Crypto Rates</div>
              <div className={classes.url}>www.cryptonite.com</div>
            </div>
          </div>
          <DialogContentText className={classes.instructions}>
            <span>Click</span>
            {ios && (
              <span>
                <img src={iosShare} alt="share" className={classes.iosIcon} />
              </span>
            )}
            {!ios && <span> share </span>}
            <span>then 'Add to Homescreen' to get our service faster!</span>
          </DialogContentText>
        </DialogContent>
        <DialogActions className={classes.background}>
          <Button onClick={handleDismissed} color="primary">
            Maybe later
          </Button>
          <Button onClick={handleAccepted} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  return <HomemadePrompt {...{ show }} />
}
