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
//    - card's sibling needs to be pushed away down rather than covered by the card
//    'toggleCardState' achieves the first by updating an application-wide (redux) state of 'fullscreen'
//    and the second by literally pushing the next sibling down, only to return it back to its original place when card gets closed.

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

import Loader from '../utility/Loader'
import { ellipsis } from '../themed/Box'

// makeStyles accepts a 'theme' argument and returns another function that optionally accepts the component's props (or anything really)
// this is by far the best way to define styling rules in a dynamic way, i.e., as a function of some changing props (Requires MUI v4)
const useStyles = makeStyles(theme => ({
  card: {
    height: '100%',
    width: '100%',
    transition: 'height 1s',
  },
  media: {
    height: ({ open }) => (open ? '50vh' : '20vh'),
    transition: 'height 1s',
  },
  listItem: {
    height: ({ open }) => (open ? '100vh' : '100%'),
    padding: ({ open }) => (open ? 0 : theme.spacing(2)),
    zIndex: ({ open }) => {
      if (open) return 1
      else {
        // even when card contracts back, it still needs to cover its siblings
        // this awaits the animation to complete before reverting the z-index back to 0
        // a better way of doing it would be to set a 3rd value to state: animation complete - and use that value here (as in 'drag & drop')
        setTimeout(function() {
          return 0
        }, 1000)
      }
    },
    transition: 'padding 1s, height 1s, top 1s',
    justifyContent: 'center',
  },
  price: {
    fontWeight: '400',
  },
}))

// ! Being a child of FixedSizeList, the height of this component is fixed as determined by FixedSizeList's itemSize prop

const Merchant = ({ loading, record, style, listRef, index }) => {
  //
  const [state, setState] = useState({ open: false })
  window.setState = setState

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
      // Pushing sibling away (and returning it) has to be done imperatively as it entails modifying the DOM elements
      const pushSiblingAway = sibling => {
        const top = Number(sibling.style.top.replace('px', ''))
        const height = Number(sibling.style.height.replace('px', ''))
        const newTop = top + height
        sibling.setAttribute('data-top', `${top}px`)
        //! Never do x.setAttribute('style', '...') since that would override other style attributes. Do the following:
        sibling.style.top = `${newTop}px`
      }

      const returnSiblingToPlace = sibling => {
        const originalTop = sibling.getAttribute('data-top')
        if (originalTop) sibling.style.top = originalTop
      }

      const { open } = state
      updateApp({ fullscreen: !open })
      setState({ open: !open })
      listRef.current.scrollToItem(index + 1, 'end')

      // state will not have changed yet when these lines are executed.
      // so 'open' actually means "about to change to close"
      const sibling = listItemRef.current.nextSibling
      open ? returnSiblingToPlace(sibling) : pushSiblingAway(sibling)
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
          <Button size="small" color="primary">
            Order
          </Button>
          <Button size="small" color="primary" onClick={toggleCardState}>
            {state && state.open ? 'Close' : 'View Offer'}
          </Button>
        </CardActions>
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
