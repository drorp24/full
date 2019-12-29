import React, { useEffect, useState, useContext, useCallback } from 'react'
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

export default function A2HSPrompt() {
  let nativeInstall = useContext(store => store.device.nativeInstall)

  const [show, setShow] = useState(false)

  const a2hs = useSelector(store => store.user.a2hs)
  const ios = useSelector(store => store.device.ios)
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
    setTimeout(prompt, 10000)
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
  const HomemadePrompt = ({ show }) => {
    const useStyles = makeStyles(theme => ({
      background: {
        backgroundColor: '#f8f8f8',
      },
      appMarketing: {
        display: 'grid',
        gridTemplateColumns: '8vh auto',
        columnGap: '1em',
        alignItems: 'center',
        fontSize: '4.5vw',
      },
      url: {
        color: '#888',
        fontSize: '4vw',
        fontWeight: '300',
      },
      instructions: {
        fontSize: '4vw',
        marginTop: '3vh',
      },
      appIcon: {
        height: '13vw',
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
      >
        <DialogTitle
          // style={{ backgroundColor: '#f8f8f8' }}
          id="alert-dialog-title"
          className={classes.background}
        >
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
            Maybe next time
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
