import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

import Div100vh from 'react-div-100vh'
import MyAppBar from './MyAppBar'
import SnackBar from './Snackbar'
import { inBrowser } from '../utility/detect'
import { makeStyles } from '@material-ui/styles'
import Paper from '@material-ui/core/Paper'
import LiveHeader from '../forms/utilities/LiveHeader'

// ! Dynamic parent must be defined outside the scope of its children
// Usually when a component is defined for the sake of one and only other component,
// it is simply defined inside that other component that needs it and used there.
// This is typically done when the defined component depends in some way on some condition
// and we don't want any conditionals inside a component tree, so we define the conditional part separeately.
//
// However in the below case, when I placed the definition of the conditioned Viewport inside Page,
// Page - and all of its content - re-rendered endlessly.
//
// The reason is that Viewport is depdendent on the Page's 'children' prop,
// but, at the same time, it *is* a part of Page's children's too
// so when it renders, it changes 'children' on which it is dependent, which makes it re-render again and so on.
//
// So if we want to define a parent component such as Page here, *and* we want to include in one of the layers
// a component *that depends on the children of what we're replacing* (Page here) then we need to define that
// children-dependent component outside the scope of the component we're defining (Page) to prevent an endless loop.
//
// Notice that Viewport's children prop are its own children
// When it was defined inside of Page I expected it to not be confusing its own children with Page's
// (which Viewport is one of) but that wasn't the case.
//
// ! Viewport height is not (necessarily) 100vh
// * Why fix this
// Keeping page dimensions to the exact ones of the mobile viewport prevents slacks when scrolling;
// This is crucial to maintaining native-like experience.
// In the browser, '100vh' is frequently *not* the exact viewport's height. It includes the mobile browser chrome.
// The actual viewport's height is window.innerHeight, which tends to change back and forth in unexpected ways when user scrolls.
// That contraction and expandsion is different from browser to browser.
//
// * <Div100vh /> to the rescue
// <Div100vh /> component uses windows.innerHeight instead of '100vh' and listens to window.resize.
// As such, it always keeps to the viewport's exact height.
// It does come with 2 caveats though, which as usual I had to learn the hard way.
//
// * 1st caveat: <Div100vh /> doesn't work on the server
// <Page /> is server-rendered as well, and Div100vh doesn't operate on the server.
// The server in this case has to generate an alternative <div style={{height: 100vh}} />
// or else the first static page would not capture the entire screen's height and a FOUC would occur as soon as React takes over.
//
// To solve this, I started by defining the 'server' as state, but no hydration occured by the the time client had to render <Page />
// Maybe that's because what the server returns looks identical to what <Div100vh /> would have rendered:
// Both have the same props, with the 'style' props having the very same key (height) with the very same value (in the first static page).
//
// Luckily, once I changed server to simply be the result of a function call rather than a state, it all worked well:
// server rendered a <div /> with height of 100vh, then client replaced it with a <Div100vh /> which renders the same div, only overrides
// the 100vh height with the calculated window.innerHeight expressed in px and modifies that height whenever window.resize fires.
// It's aparent that replacement took place by looking at the 'id' and 'height' of the div as accepted by the server ('network' tab)
// as opposed to the different 'id' and 'height' of that div once client hydrated it.
//
// * 2nd caveat: <Div100vh /> does not re-render when 'rvh' prop gets changed
// Originally I used the 'rvh' style properties to define the heights of the sub-components.
// But while they (probably) respond well to changes in window.innerHeight, they don't respond to changes in their values.
// So when I introduced the changing height with scrolling, the height didn't change.
// I then ditched the use of <Div100vh /> with 'rvh' units for the sub-components, defining their heights with percentages instead.
// If indeed <Div100vh /> with 'rvh' listens to and modified with 'resize' events then it's anyway a bad idea to use
// <Div100vh /> more than once in a page. 'grid' would seem the classic way to divide a component but it doesn't transition,
// so I've used height percentages instead, and 'height' transitions beautifully.

// ! <Autosizer/>'s closest ancestor must have explicit height
// <main> tag below is added for screen readers (= to get Lighthouse 100 grade)
// But then it becomes an immediate child of Box, which being a flexbox defines rules for its immediate children
// The proper way to treat any tag such as <main> as something semantic and apply the flex rule to its child where it belongs
// is to make its display: 'content,' rather than making its height and width 100%.
//
// In this particular case however, I left main with 'height: 100%' since downstream <AutoSizer />
// requires its closest ancestor div to have *explicit* height,
// according to which it calculates the height and width of each item it provides to FixedSizeList's render prop function.
//
// When <Autosizer />'s closest parent is left with no height, the merchants list becomes blank.
// If it happens next time, I should look for the closest parent <div /> and make sure it comes with explicit height.
// <Autosizer /> has quite many React components above it, but they are mostly HOCs, not rendering anything.
//
// ! Prevent distorted layout on orientation change
//
// There's no point in adapting an app to landscape layout if it provides no benefit that way.
// When as app is not built for landscape orientation, as in this case,
// the best way I've found to save the otherwise distorted layout is to simply rotate the display upon orientation change
// and asking the user to rotate back via a snackbar.
// (the orientation block web API is active in standalone mode only).
//
// At a minimum, <body /> tag should be rotated with its height set to '100vw' and its width set to '100vh'.
// That is since when rotated, the height and width of the screen
// confusingly reflect the *old* height and width in spite of the rotation
// while the 'vh' and 'vw' units reflect the *new* height and width.
// Rotation (= transform: rotate) angle should be -90 (= 270) deg since that's the direction right-handed people would rotate,
// and transform-origin should be set to '50vh 50vh' in this direction.
//
// But that's not enough. Since the div implementing <Page /> has a hard-coded height,
// that hard-coded height also needs to be modified to '100vw'.
// (I changed the width as well but it doesn't seem to change anything and is probably not needed).
//
// The 3rd thing I had to do was to generate a SnackBar upon orientation change,
// and hack that SnackBar's width to capture the entire width (minus gutters) when rotated,
// and for that I informed redux of orientation change, so SnackBar can detect this and display the proper snackbar message.
// Long duration plus reverse state make this snackbar keep showing until state is reversed,
// so that snackbar won't go away until user rotates back into desired orientation.
//
const Viewport = ({ children, noAppBar }) => {
  const server = !inBrowser()
  const useStyles = makeStyles(theme => ({
    viewport: {
      width: '100%',
      '@media only screen and (orientation: landscape)': {
        height: '100vw !important',
        width: '100vh !important',
      },
    },
  }))

  const classes = useStyles()

  return server ? (
    <div
      style={{ height: '100vh' }}
      className={classes.viewport}
      id="viewportServer"
    >
      {children}
    </div>
  ) : (
    <Div100vh className={classes.viewport} id="viewportClient">
      {children}
    </Div100vh>
  )
}

const Page = ({ title, icon, noAppBar, noBack, children }) => {
  const { scrolling, layout, contextual } = useSelector(store => store.app)
  const { pathname } = useLocation()

  // * Why is contextual commented
  // Originally I wanted LiveHeader to disappear if it is still on when a merchant card gets expanded
  // But when the card expands to 90% (here), it doesn't work well with what it should do in parallel (in Merchant.js)
  // which is to shift its previous card away; previous card doesn't get shifted and the expanded card remains stuck
  // in the middle of the page.
  // Guess this is the price for doing imperative stuff.
  // Simply gave up shrinking LiveHeader upon expansion, and left this comment to remember.

  const includeLiveHeader =
    !noAppBar &&
    (pathname === '/select' ||
      (pathname === '/merchants' &&
        !scrolling &&
        // !contextual &&
        layout === 'vertical'))

  const appBarHeightPercent = noAppBar ? 0 : 10
  const liveHeaderHeightPercent = includeLiveHeader ? 20 : 0
  const mainHeightPercent = 100 - appBarHeightPercent - liveHeaderHeightPercent

  const boxShadow =
    '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)'

  const useStyles = makeStyles(theme => ({
    appBar: {
      height: `${appBarHeightPercent}%`,
      backgroundColor: contextual
        ? theme.palette.background.contextual
        : theme.palette.primary.main,
      boxShadow: includeLiveHeader ? 'none' : boxShadow,
      transition: 'box-shadow 1s 2s',
    },
    liveHeader: {
      height: `${liveHeaderHeightPercent}%`,
      transition: 'height 1.5s',
      backgroundColor: theme.palette.primary.main,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      ...(includeLiveHeader && {
        boxShadow,
      }),
      overflow: 'hidden',
    },
    main: {
      height: `${mainHeightPercent}%`,
    },
  }))
  const classes = useStyles()

  return (
    <Paper square>
      <Viewport {...{ noAppBar }}>
        <div className={classes.appBar}>
          {!noAppBar && <MyAppBar {...{ title, icon, noBack }} />}
        </div>
        <div className={classes.liveHeader}>
          <LiveHeader />
        </div>
        <div className={classes.main}>
          <main style={{ height: '100%' }}>{children}</main>
        </div>
        <SnackBar />
      </Viewport>
    </Paper>
  )
}

export default Page
