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
//    - AppBar needs to contract away, signalling a 'fullscreen' mode
//    - both card's siblings need to be pushed away to make toom for the expanding card
//    'toggleCardState' achieves the first by updating an application-wide (redux) state of 'fullscreen'
//    and the second by manipulating their 'height's and 'top's back and forth.
//    Note: react-window's own .scroll api will not animate. Instead, I'm modifying the list-item's top properties and height if needed.

import React, { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { setApp } from '../../redux/actions'

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
import ListAlt from '@material-ui/icons/ListAlt'
import Zoom from '@material-ui/core/Zoom'

import Loader from '../utility/Loader'
import { ellipsis } from '../themed/Box'

const appBarHeight = window.innerHeight / 10
// makeStyles accepts a 'theme' argument and returns another function that optionally accepts the component's props (or anything really)
// this is by far the best way to define styling rules in a dynamic way, i.e., as a function of some changing props (Requires MUI v4)
const useStyles = makeStyles(theme => ({
  card: {
    height: '100%',
    width: '100%',
    transition: 'height 1s',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  media: {
    height: ({ open }) => (open ? '50vh' : '20vh'),
    transition: 'height 1s',
  },
  listItem: {
    height: ({ open }) => (open ? '100vh' : '100%'),
    padding: ({ open }) => (open ? 0 : theme.spacing(2)),
    zIndex: ({ open }) => (open ? 1 : 0),
    transition: 'padding 1s, height 1s, top 1s',
    justifyContent: 'center',
  },
  price: {
    fontWeight: '400',
  },
  viewOfferButton: {
    display: ({ open }) => (open ? 'none' : 'block'),
  },

  fab: {
    visibility: ({ open }) => (open ? 'visible' : 'hidden'),
    position: 'absolute',
    margin: theme.spacing(2),
    marginTop: 0,
    top: 'calc(50vh - 28px)',
    right: 0,
  },
}))

// ! Being a child of FixedSizeList, the height of this component is fixed as determined by FixedSizeList's itemSize prop

const Merchant = ({ loading, record, style, listRef, index }) => {
  //
  const [state, setState] = useState({ open: false })
  const { open } = state

  const dispatch = useDispatch()
  const updateApp = useCallback(app => dispatch(setApp(app)), [dispatch])

  const classes = useStyles(state)
  const listItemRef = React.useRef()

  const MerchantCard = ({ record, listItemRef }) => {
    const imgUri = `https://maps.googleapis.com/maps/api/streetview?size=400x400&location=${
      record.location.coordinates[1]
    },${record.location.coordinates[0]}&fov=90&key=${
      process.env.REACT_APP_GOOGLE_API_KEY
    }`

    // toggleCardState implements MD recommended card expansion: https://uxdesign.cc/good-to-great-ui-animation-tips-7850805c12e5
    const toggleCardState = () => {
      // Pushing siblings away (and returning them) has to be done imperatively as it entails modifying their respective DOM elements
      const pushSiblingsAway = (
        previousSibling,
        currentSibling,
        nextSibling
      ) => {
        //
        const measureTopHeight = element => {
          if (!element) return { element: null }
          const top = Number(element.style.top.replace('px', ''))
          const height = Number(element.style.height.replace('px', ''))
          const y = element.getBoundingClientRect().y
          return { element, top, height, y }
        }

        const setTopHeight = ({ element, top, newTop, height, newHeight }) => {
          if (!element) return

          const defined = property =>
            typeof property !== 'undefined' && property !== null // we don't want to update DOM unnecessarily, but '0' is a value

          if (defined(newTop)) {
            element.setAttribute('data-top', `${top}px`)
            element.style.top = `${newTop}px` // Never x.setAttribute('style', '...') as it would override other style properties
          }
          if (defined(newHeight)) {
            element.setAttribute('data-height', `${height}px`)
            element.style.height = `${newHeight}px`
          }
        }

        //! Transition
        // I'm assuming maximum 3 items in a viewport, otherwise this should be done in a loop
        const [previous, current, next] = [
          previousSibling,
          currentSibling,
          nextSibling,
        ].map(measureTopHeight)

        previous.newTop = Math.max(previous.top - current.y, 0)
        if (previous.newTop === 0)
          previous.newHeight = Math.max(previous.height - current.y, 0) // if there's no room to retreat, contract
        current.newTop = Math.max(current.top - current.y + appBarHeight, 0)
        next.newTop = next.top + (window.innerHeight - next.y + appBarHeight)

        for (let item of [previous, current, next]) {
          setTopHeight(item)
        }
      }

      const restoreTopHeight = element => {
        if (!element) return
        const originalTop = element.getAttribute('data-top')
        if (originalTop) element.style.top = originalTop
        const originalHeight = element.getAttribute('data-height')
        if (originalHeight) element.style.height = originalHeight
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

      //  Tried setTimeout'ing a 'transition' state to have the FAB pop up only once transition finishes
      //  It sat in the same state object with 'state' since MUI's makeStyle accepts only one prop argumement.
      //  I ended up abandoning it since it made the component re-render and the animation to flicker.
      updateApp({ fullscreen: !open })
      setState({ open: !open })

      const { previousSibling, nextSibling } = listItemRef.current
      const currentSibling = listItemRef.current

      !open
        ? pushSiblingsAway(previousSibling, currentSibling, nextSibling)
        : returnSiblingsToPlace(previousSibling, currentSibling, nextSibling)
    }

    return (
      <Card className={classes.card} onClick={toggleCardState}>
        <CardActionArea>
          <CardMedia
            className={classes.media}
            image={imgUri}
            title="Contemplative Reptile"
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
              {Number(
                record && record.quote && record.quote.price
                  ? record.quote.price.toFixed(2)
                  : 0
              ).toLocaleString(undefined, {
                style: 'currency',
                currency: record.quote.quote,
              })}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Button size="small" color="primary" className={classes.orderButton}>
            Order
          </Button>
          <Button
            size="small"
            color="primary"
            onClick={toggleCardState}
            className={classes.viewOfferButton}
          >
            View
          </Button>
        </CardActions>
        <Zoom in timeout={{ enter: 1000 }}>
          <Fab color="primary" aria-label="Add" className={classes.fab}>
            <ListAlt />
          </Fab>
        </Zoom>
      </Card>
    )
  }

  // FixedSizeList/itemSize dictates the hard-coded height of every item (see above) in the 'height' property of the passed-on 'style' prop.
  // Overriding the height in the event of opening a card could have been simply defined here by '100vh!important'
  // For some reason, useStyles will not pass '<anything>!important' so I'm doing this hack to force the height into 100vh once card is open
  const { height, ...styleExceptHeight } = style
  const styleToUse = state && state.open ? styleExceptHeight : style

  return (
    <>
      <ListItem
        style={styleToUse}
        className={classes.listItem}
        disableGutters={true}
        ref={listItemRef}
      >
        {loading ? <Loader /> : <MerchantCard {...{ record, listItemRef }} />}
      </ListItem>
    </>
  )
}

export default Merchant
