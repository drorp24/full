// ! Expanding a card: the challenges
//
// *  Routing
//    Making the expanded card a different route, and dealing with 2 concurrent routes for a while
//    - I don't think it's necessary to deep-link into the expanded card nor that it's a state of its own; rather, it is an expansion (like 'more..', accordion etc);
//    - back-arrow should simply contract the card back rather than replace route
// *  Windowing
//    react-window creates a very long element whose items are each relatively positioned within in.
//    The fact the react-window places the list items as fixed positions elements, each with its hard-coded 'top' (rather than 'div's or 'li's)
//    means that it's not easy to scroll the list nor to expand a card - without overriding siblings.
//    But this is exactly what's needed when user selects an item by clicking it:
//    The list needs to be scrolled so that the item is positioned at page's top, and the item needs to expand to capture the entire screen.
//    This can't be achieved by either 'position: static' nor by 'top: 0'.
//    Instead, the entire list needs to be scrolled to position the selected item exactly at the viewport's tops.
//    react-window provides an API that scrolls to a given card (swiper.js also provided such an API) but I'm not using it.
//    Instead, when a card is clicked, I'm doing a transition that takes care of both the "scrolling" and the expansion.
//    It also pushes the nearest siblings away and triggers a change in the AppBar's state, ex described in the next section:
// *  Transition
//    Though not mandatory, MD most elegant way of expanding a card is by pushing other items away, not only capturing the entire screen.
//    (as demonstrated in https://uxdesign.cc/good-to-great-ui-animation-tips-7850805c12e5)
//    This means that
//    - Selected merchant card needs to be scrolled to page's top and expanded
//    - AppBar needs to switch into contextual menu - which means that *another* component needs to be aware of the state of this component and react
//    - both card's siblings need to be pushed away to make room for the expanding card - again, two *other* components need to be aware and react
//    Scrolling the selected merchant card and expanding it is done by manipulating its 'top' and 'height' css properties
//      react-window's has its own .scroll api but it will not animate. So I'm doing it myself.
//    The AppBar effect is achieved by informing redux of the contextual state:
//      since it is in redux, AppBar 'see's the change in the card's state and changes its own state accordingly
//      This is the React way of doing it: declaratively.
//    For the siblings, I did it imperatively:
//      there's a function that finds the previous & next DOM siblings and manipulates their 'height's and 'top's (also recording their original values).
//      That function is triggered whenever the card changes state, pushing siblings away and returning them to their original places.
//      This is not the React way of doing things. If not fot react-window then I'd probably pass the 'top' and 'height' as props, but
//      react-window doesn't let you control the rendering of the list items;
//      it will only let you define a list item and pass its render definition as an argument.
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
// *  Clicking the back arrow on the mobile browser
//    Clicking back automatically resets the card's state by the sheer fact we've moved to another page that contains no cards
//    But while React automatically [...], it does not automatically change the redux' 'contextual' state.
//    As soon as I've noticed the bug, I've intercepted the 'back' click and reset the 'contextual' indication
//    But if there's another 'external' way to switch pages or close cards I'm not thinking about, the AppBar will remain contextual
//    I wonder if tehre's a *declaratve* way of saying that, unless a card is [...], there's no 'contextual'. Probably not.
//
import React, { useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setContextual, setShouldClose } from '../../redux/actions'

import ListItem from '@material-ui/core/ListItem'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/styles'
import Card from '@material-ui/core/Card'
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
import { isInStandaloneMode } from '../utility/detect'

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

  // * using 'window' is okay as long as any reference to it is made within a function or component that is performed only while on the client
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

const standaloneMode = isInStandaloneMode()
//
// * Being a child of FixedSizeList, the height of this component is fixed as determined by FixedSizeList's itemSize prop
const Merchant = ({ loading, record, style }) => {
  const [state, setState] = useState({ open: false })
  const { open } = state

  const toggleState = () => {
    setState({ open: !open })
  }

  // ! Challenges of card's height
  //
  // * The Issue: '100vh' is not the viewport's height; it's the heights of the viewport + browser's chrome + address bar
  //   Mobile experience frequently entails having a 'Page' which is precisely the viewport's height.
  //   But 100vh is not the actual viewable viewport.
  //   Counting on 100vh would make some page's components (esp. if desinbed to be at a given margin from bottom) hidden.
  //   To overcome this, window.innerHeight is used instead of 90vh.
  //   NOTE: for that purpose it's actually safer to use the <Div100vh /> component rather than innerHeight * something - see note in AppBar.js
  //
  // * The Issue: height in a windowed list is imposed; this can make a card content truncated
  //   The height of every merchant card rendered here is governed by react-window.
  //   react-window calculates that height according to the 'itemCount'.
  //   It passes the height to each 'li' within the 'style' prop, making height sit on the DOM element - hence fixed.
  //   The height restriction should be taken into account in the card design or else its content may be truncated.
  //
  //   In my case, every card has a 'media' part and a 'content' part.
  //   When I initially set them both to 50% height, each of them got precisely 50% of the card's height, and then 'content' got truncated.
  //   When 'content' was then relieved of the exact height rule, the 'media' part shrinked when 'content' needed more room (when the browser included its chrome)
  //   and got 50% of the height when 'content' managed with 50% of the card's height (when the browser was in standalone, chromeless mode).
  const useStyles = makeStyles(theme => ({
    listItem: {
      height: ({ open }) => (open ? window.innerHeight * 0.9 : '100%'),
      padding: ({ open }) => (open ? 0 : theme.spacing(2)),
      zIndex: ({ open }) => (open ? 1 : 0),
      transition: 'padding 1s, height 1s, top 1s',
      justifyContent: 'center',
    },
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
      height: '50%',
      transition: 'height 1s',
    },
    content: {
      minHeight: '50%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      paddingBottom: 'unset',
    },
    contentText: {},
    closeActions: {
      display: ({ open }) => (open ? 'none' : 'block'),
      paddingLeft: '0',
    },
    openActions: {
      display: ({ open }) => (open ? 'flex' : 'none'),
      paddingLeft: '0',
      justifyContent: 'flex-end',
    },
    price: {
      fontWeight: '400',
    },

    btn: {
      paddingLeft: '0',
    },
    fab: {
      visibility: ({ open }) => (open ? 'visible' : 'hidden'),
      margin: theme.spacing(3),
      alignSelf: 'flex-end',
    },

    threeSixty: {
      visibility: ({ open }) => (open ? 'visible' : 'hidden'),
      position: 'absolute',
      top: standaloneMode ? '35vh' : '30vh',
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

    const toggleCardState = useCallback(
      e => {
        // Clicking 'View' will trigger 'toggleCardState' twice if not for this line, misplacing the card
        if (e) e.stopPropagation()

        // Clicking an open card should not close it
        if (open && !shouldClose) return

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
      },
      [listItemRef, record.name]
    )

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

    useEffect(() => {
      window.onpopstate = function() {
        resetContextual()
      }
    })

    return (
      <Card className={classes.card} onClick={toggleCardState}>
        {/* <CardActionArea style={{ height: '100%' }}> */}
        <CardMedia
          className={classes.media}
          image={imgUri}
          title="Contemplative Reptile"
          ref={cardMediaRef}
        />
        <CardContent className={classes.content} style={{ paddingBottom: '0' }}>
          <div className={classes.contentText}>
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
          </div>

          <CardActions className={classes.closeActions}>
            <Button size="large" color="primary" className={classes.btn}>
              Order
            </Button>
            <Button
              size="large"
              color="primary"
              onClick={toggleCardState}
              className={classes.btn}
            >
              View
            </Button>
          </CardActions>
          <CardActions className={classes.openActions}>
            <Zoom in timeout={{ enter: 1000 }}>
              <Fab color="primary" aria-label="Add" className={classes.fab}>
                <ShoppingCart />
              </Fab>
            </Zoom>
          </CardActions>
          <Zoom in timeout={{ enter: 1000 }}>
            <Fab
              size="small"
              className={classes.threeSixty}
              onClick={toggleStreetView(cardMediaRef, record)}
            >
              <ThreeSixty color="primary" />
            </Fab>
          </Zoom>
        </CardContent>
        {/* </CardActionArea> */}
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
