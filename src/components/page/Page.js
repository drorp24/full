import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setValue } from '../../redux/actions'
import { SET_DEVICE } from '../../redux/types'

import { Box } from '../themed/Box'
import Div100vh from 'react-div-100vh'
import MyAppBar from './MyAppBar'
import SnackBar from './Snackbar'
import { inBrowser } from '../utility/detect'
import { makeStyles } from '@material-ui/styles'

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
// In the browser, '100vh' is frequently *not* the exact viewport's height. It includes the mobile browser chrome.
// The actual viewport's height is window.innerHeight, which tends to contract and expand with scrolling in unexpected ways,
// and different from browser to browser.
// <Div100vh /> component uses windows.innerHeight instead of '100vh' and listens to window.resize.
// As such, it always keeps to the viewport's exact height.
// Keeping page dimensions to the exact ones of the mobile viewport prevents slacks and is crucial to maintaining native-like experience.
//
// But <Page /> is server-rendered as well, and Div100vh doesn't operate on the server.
// The server in this case has to generate an alternative <div style={{height: 100vh}} />
// or else the first static page would not capture the entire screen's height and a FOUC would occur as soon as React takes over.
//
// To solve this, I started by defining the 'server' as state, but no hydration occured by the the time client had to render <Page />
// Maybe that's because what the server returns looks identical to what <Div100vh /> would have rendered:
// Both have the same props, with the 'style' props having the very same key (height) with the very same value (in the first static page).
// Luckily, once I changed server to simply be the result of a function call rather than a state, it all worked well:
// server rendered a <div with height of 100vh, then client replaced it with a <Div100vh /> which renders the same div, only overrides
// the 100vh height with the calculated window.innerHeight expressed in px and modifies that height whenever window.resize fires.
// It's aparent that replacement took place by looking at the 'id' and 'height' of the div as accepted by the server ('network' tab)
// as opposed to the different 'id' and 'height' of that div once client hydrated it.

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
const Viewport = ({ children, percent, server, id }) => {
  const useStyles = makeStyles(theme => ({
    root: {
      width: '100%',
      '@media only screen and (orientation: landscape)': {
        height: percent => `${percent}vw !important`,
        width: percent => (percent === 100 ? '100vh' : '100%'),
      },
    },
  }))

  const classes = useStyles(percent)

  const unit = server ? 'vh' : 'rvh'

  return server ? (
    <div
      style={{ height: `${percent}${unit}` }}
      className={classes.root}
      id={id}
    >
      {children}
    </div>
  ) : (
    <Div100vh
      style={{ height: `${percent}${unit}` }}
      className={classes.root}
      id={id}
    >
      {children}
    </Div100vh>
  )
}

const Page = ({ title, icon, noAppBar, noBack, children }) => {
  const appBarHeightPercent = noAppBar ? 0 : 10
  const mainHeightPercent = 100 - appBarHeightPercent
  // TODO: maybe 'server' needs to be a state
  const server = !inBrowser()

  const dispatch = useDispatch()
  useEffect(() => {
    const setOrientation = orientation =>
      dispatch(
        setValue({
          type: SET_DEVICE,
          key: 'orientation',
          value: orientation,
        })
      )
    const mql = window.matchMedia('(orientation: landscape)')
    mql.addListener(({ matches }) => {
      setOrientation(matches ? 'landscape' : 'portrait')
    })
  }, [dispatch])

  return (
    <Viewport
      percent={100}
      server={server}
      id={'viewport' + (server ? 'Server' : 'Client')}
    >
      <Box pageVariant="content">
        <Viewport percent={appBarHeightPercent} server={server}>
          {!noAppBar && <MyAppBar {...{ title, icon, noBack }} />}
        </Viewport>
        <Viewport percent={mainHeightPercent} server={server}>
          <main
            style={{
              height: '100%',
            }}
          >
            {children}
          </main>
        </Viewport>
        <SnackBar />
      </Box>
    </Viewport>
  )
}

export default Page
