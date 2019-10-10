// ! Expanding a card: the challenges
//
// *  Routing
//    Making the expanded card a different route, and dealing with 2 concurrent routes for a while
//    - I don't think it's necessary to deep-link into the expanded card nor that it's a state of its own; rather, it is an expansion (like 'more..', accordion etc);
//    - back-arrow should simply contract the card back rather than replace route
// *  Windowing
//    react-window creates a very long element whose items are each relatively positioned within in.
//    When user then picks an item to expand, the item needs to capture the entire screen, top to bottom.
//    This can't be achieved by either 'position: static' nor by 'top: 0'.
//    Instead, the entire list needs to be scrolled to position the selected item exactly at the viewport's tops.
//    Luckily, react-window provides an API that scrolls to a given card (swiper.js also provided such an API)
// *  Transition
//    Though not mandatory, MD most elegant way of expanding a card is by pushing other items away, not only capturing the entire screen.
//    (as demonstrated in https://uxdesign.cc/good-to-great-ui-animation-tips-7850805c12e5)
//    This means that
//    - AppBar needs to switch into contextual menu
//    - both card's siblings need to be pushed away to make toom for the expanding card
//    'toggleCardState' achieves the first by updating an application-wide (redux) state of 'fullscreen'
//    and the second by manipulating their 'height's and 'top's back and forth.
//    Note: react-window's own .scroll api will not animate. Instead, I'm modifying the list-item's 'top' and 'height' as needed.
//
// !  Challenges of communicating b/w two components
//
// *  Informing AppBar
//    When a card expands, AppBar needs to know about that and respond by changing the menu into a contextual menu (change hamburger into 'X' etc)
//    That's the easy part, since AppBar needs only display either the hamburger or the 'X' according to redux' 'contextual' value
//
// *  Informing Merchant
//    When the 'X' in the contextual menu is clicked, merchant card needs to know about that and repsond by contracting.
//    Unlike AppBar however, Merchant card can not settle for displaying this or the other according to some redux value;
//    Instead, it is required to re-render and change its internal state (to 'close') in response for the 'X' click.
//    There's no listener in react nor a way to emit events from one components that the other can listen to;
//    Instead, Merchants gets updated by the redux status change by 'useSelector' (formerly 'connect')
//    Now for the odd part: I assumed it is the redux state change ('shouldClose') *only* that, thru 'useSelector' triggers the re-rendering of the Merchant component
//    Oddly though, when I commented all references to useSelector, the Merchant component still got re-rendered inspite of no change in either of its props)
//
import React, { useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setContextual, setShouldClose } from '../../redux/actions'

import ListItem from '@material-ui/core/ListItem'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import Fab from '@material-ui/core/Fab'
import ThreeSixty from '@material-ui/icons/ThreeSixty'
import ShoppingCart from '@material-ui/icons/ShoppingCart'
import Zoom from '@material-ui/core/Zoom'

import Loader from '../utility/Loader'
import { ellipsis } from '../themed/Box'

// makeStyles accepts a 'theme' argument and returns another function that optionally accepts the component's props (or anything really)
// this is by far the best way to define styling rules in a dynamic way, i.e., as a function of some changing props (Requires MUI v4)

const measureTopHeight = element => {
  if (!element) return { element: null }
  const top = Number(element.style.top.replace('px', ''))
  const height = Number(element.style.height.replace('px', ''))
  const y = element.getBoundingClientRect().y
  return { element, top, height, y }
}

const restoreTopHeight = element => {
  if (!element) return
  const originalTop = element.getAttribute('data-top')
  if (originalTop) element.style.top = originalTop
  const originalHeight = element.getAttribute('data-height')
  if (originalHeight) element.style.height = originalHeight
}

const pushSiblingsAway = (previousSibling, currentSibling, nextSibling) => {
  const setTopHeight = ({ element, top, newTop, height, newHeight }) => {
    if (!element) return

    const defined = property =>
      typeof property !== 'undefined' && property !== null // we don't want to update DOM unnecessarily, but '0' is a value

    if (defined(newTop)) {
      element.setAttribute('data-top', `${top}px`)
      element.style.top = `${newTop}px` // ! Never x.setAttribute('style', '...') as it would override other style properties
    }
    if (defined(newHeight)) {
      element.setAttribute('data-height', `${height}px`)
      element.style.height = `${newHeight}px`
    }
  }

  // I'm assuming maximum 3 items in a viewport, otherwise this should be done in a loop
  const [previous, current, next] = [
    previousSibling,
    currentSibling,
    nextSibling,
  ].map(measureTopHeight)

  // ! using 'window' is okay as long as any reference to it is made within a function or component that is performed only while on the client
  const appBarHeight = window.innerHeight / 10

  previous.newTop = Math.max(previous.top - current.y, 0)
  if (previous.newTop === 0)
    previous.newHeight = Math.max(previous.height - current.y, 0) // if there's no room to retreat, contract
  current.newTop = current.top - current.y + appBarHeight
  next.newTop = next.top + (window.innerHeight - next.y) + appBarHeight

  for (let item of [previous, current, next]) {
    setTopHeight(item)
  }
}

const returnSiblingsToPlace = (
  previousSibling,
  currentSibling,
  nextSibling
) => {
  for (let element of [previousSibling, currentSibling, nextSibling]) {
    restoreTopHeight(element)
  }
}

const toggleSiblings = (open, listItemRef) => {
  const { previousSibling, nextSibling } = listItemRef.current
  const currentSibling = listItemRef.current
  !open
    ? pushSiblingsAway(previousSibling, currentSibling, nextSibling)
    : returnSiblingsToPlace(previousSibling, currentSibling, nextSibling)
}

// couldnt for the life of me get the list's ref so am traversing to find it
const toggleScrolling = (open, listItemRef) => {
  const listElement = listItemRef
    ? listItemRef.current.parentNode.parentNode
    : document.getElementById('list')
  console.log('listElement: ', listElement)
  window.listElement = listElement
  listElement.style.overflow = open ? 'auto' : 'hidden'
  listElement.id = 'list'
}

//
// * Being a child of FixedSizeList, the height of this component is fixed as determined by FixedSizeList's itemSize prop
const Merchant = ({ loading, record, style }) => {
  const [state, setState] = useState({ open: false })
  const { open } = state

  const toggleState = () => {
    setState({ open: !open })
  }

  // ! Using window.innerHeight instead of css vh units
  //   window.innerHeight is used instead of 90vh for the same reason <Div100vh /> was used in Page:
  //   100vh includes the height of the mobile browsers' chromes.
  //   So if I need an element to be on a fixed margin from (viewable) viewport bottom I'd need to use innerHeight rather than vh.
  //   again, using the 'window' variable here below will not break the build since it is included inside of a function that would only run on the client.
  const useStyles = makeStyles(theme => ({
    card: {
      height: '100%',
      width: '100%',
      transition: 'height 1s',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderRadius: ({ open }) => (open ? '0px' : '4px'),
    },
    media: {
      height: ({ open }) => (open ? '45vh' : '20vh'),
      transition: 'height 1s',
    },
    listItem: {
      height: ({ open }) => (open ? window.innerHeight * 0.9 : '100%'),
      padding: ({ open }) => (open ? 0 : theme.spacing(2)),
      zIndex: ({ open }) => (open ? 1 : 0),
      transition: 'padding 1s, height 1s, top 1s',
      justifyContent: 'center',
    },
    price: {
      fontWeight: '400',
    },
    cardActions: {
      display: ({ open }) => (open ? 'none' : 'block'),
    },
    fab: {
      visibility: ({ open }) => (open ? 'visible' : 'hidden'),
      margin: theme.spacing(3),
      alignSelf: 'flex-end',
    },
    threeSixty: {
      visibility: ({ open }) => (open ? 'visible' : 'hidden'),
      position: 'absolute',
      top: '35vh',
      right: 0,
      margin: theme.spacing(3),
      marginTop: 0,
      zIndex: 1,
    },
    arrowBack: {
      visibility: ({ open }) => (open ? 'visible' : 'hidden'),
      position: 'absolute',
      top: '10vh',
      left: 0,
      margin: theme.spacing(3),
      marginTop: 0,
    },
  }))

  const classes = useStyles(state)
  const listItemRef = React.useRef()

  const dispatch = useDispatch()
  const setContextualMenu = useCallback(
    contextual => dispatch(setContextual(contextual)),
    [dispatch]
  )
  const shouldClose = useSelector(store => store.app.shouldClose)
  const resetShouldClose = useCallback(() => dispatch(setShouldClose(false)), [
    dispatch,
  ])
  const resetContextual = useCallback(
    () => dispatch(setContextual({ contextual: false, name: null })),
    [dispatch]
  )

  const MerchantCard = ({ record, listItemRef }) => {
    const [streetView, setStreetView] = useState(false)
    const [permissionGranted, setPermissionGranted] = useState(false)

    const imgUri = `https://maps.googleapis.com/maps/api/streetview?size=400x400&location=${
      record.location.coordinates[1]
    },${record.location.coordinates[0]}&fov=90&key=${
      process.env.REACT_APP_GOOGLE_API_KEY
    }`

    const price = record =>
      Number(
        record && record.quote && record.quote.price
          ? record.quote.price.toFixed(2)
          : 0
      ).toLocaleString(undefined, {
        style: 'currency',
        currency: record.quote.quote,
      })

    const toggleCardState = useCallback(() => {
      // if (open && !shouldClose) return

      toggleState()

      toggleScrolling(open, listItemRef)

      toggleSiblings(open, listItemRef)

      if (shouldClose) {
        resetShouldClose()
        resetContextual()
        toggleScrolling(open, listItemRef)
      } else {
        setContextualMenu({ contextual: true, name: record.name })
      }
    }, [listItemRef, record.name])

    const grantPermission = () => {
      if (
        DeviceMotionEvent &&
        typeof DeviceMotionEvent.requestPermission === 'function'
      ) {
        DeviceMotionEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              window.addEventListener('devicemotion', () => {})
              setPermissionGranted(true)
            }
          })
          .catch(console.error)
      } else if (
        DeviceOrientationEvent &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', () => {})
              setPermissionGranted(true)
            }
          })
          .catch(console.error)
      } else {
        console.log(
          'Neither DeviceMotionEvent nor DeviceOrientationEvent are supported'
        )
      }
    }

    const toggleStreetView = useCallback(
      (ref, record) => () => {
        if (
          !ref ||
          !ref.current ||
          !record ||
          !record.location ||
          !record.location.coordinates
        )
          return

        const { coordinates } = record.location
        const [lat, lng] = [coordinates[1], coordinates[0]]
        const element = ref.current

        if (!permissionGranted) grantPermission()

        if (!streetView && window) {
          new window.google.maps.StreetViewPanorama(element, {
            position: { lat, lng },
            zoomControl: false,
            addressControl: false,
            linksControl: false,
          })
        } else {
          element.innerHTML = ''
        }

        setStreetView(!streetView)
      },
      [streetView, permissionGranted]
    )

    const cardMediaRef = React.useRef()

    useEffect(() => {
      if (open && shouldClose) {
        toggleCardState()
      }
    }, [toggleCardState])

    return (
      <Card className={classes.card} onClick={toggleCardState}>
        <CardActionArea>
          <CardMedia
            className={classes.media}
            image={imgUri}
            title="Contemplative Reptile"
            ref={cardMediaRef}
          />
          <CardContent>
            <Typography
              style={{ ...ellipsis }}
              gutterBottom
              variant="h5"
              component="h2"
            >
              {record.name}
            </Typography>
            <Typography
              style={{ ...ellipsis }}
              variant="body2"
              color="textSecondary"
              component="p"
              gutterBottom
            >
              {record.address || 'No address recorded'}
            </Typography>
            <Typography variant="h6" className={classes.price}>
              {price(record)}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions className={classes.cardActions}>
          <Button size="small" color="primary">
            Order
          </Button>
          <Button size="small" color="primary" onClick={toggleCardState}>
            View
          </Button>
        </CardActions>
        <Zoom in timeout={{ enter: 1000 }}>
          <Fab color="primary" aria-label="Add" className={classes.fab}>
            <ShoppingCart />
          </Fab>
        </Zoom>
        <Zoom in timeout={{ enter: 1000 }}>
          <Fab
            size="small"
            className={classes.threeSixty}
            onClick={toggleStreetView(cardMediaRef, record)}
          >
            <ThreeSixty color="primary" />
          </Fab>
        </Zoom>
      </Card>
    )
  }

  // FixedSizeList/itemSize dictates the hard-coded height of every item (see above) in the 'height' property of the passed-on 'style' prop.
  // Overriding the height in the event of opening a card could have been simply defined here by '100vh!important'
  // Unfortunately for some reason, useStyles will not pass '<anything>!important' so I'm doing this hack to force the height into 100vh once card is open
  const { height, ...styleExceptHeight } = style
  const styleToUse = state && state.open ? styleExceptHeight : style

  return (
    <ListItem
      style={styleToUse}
      className={classes.listItem}
      disableGutters={true}
      ref={listItemRef}
    >
      {loading ? <Loader /> : <MerchantCard {...{ record, listItemRef }} />}
    </ListItem>
  )
}

export default Merchant
