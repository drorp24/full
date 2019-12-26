import React from 'react'
import { Box } from '../themed/Box'
import Div100vh from 'react-div-100vh'
import MyAppBar from './MyAppBar'
import SnackBar from './Snackbar'
import { inBrowser } from '../utility/detect'

// ! Viewport height
// In the browser, '100vh' is frequently *not* the exact viewport's height. It includes the mobile browser chrome.
// The actual viewport's height is window.innerHeight, which tends to change with scrolling, when browser chrome contracts and expands.
// <Div100vh /> always keeps to the viewport's exact height, and as such guarantees native-like experience with no page slack.
// But <Page /> is server-rendered as well, and Div100vh doesn't operate on the server.
// Worst yet, <Div100vh /> when rendered on the server ignores the 'style' property and creates an heightless <div>.
// So my own <Viewport /> does pass the 'style' property into the <div>, and renders a <Div100vh /> when on the client.

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
// ! TODO: following note may have to be removed
// In this version I replaced 'server' from being a state into just a constant.
// If that works find, I have to remove the following section.
// ! Forcing hydration to re-render in spite of identical tag and props
//
// * Div100vh is not active on the server
// The need for the above condition stems from the fact that on the server, with no device or browser, Div100vh has no meaning
// The server in this case has to generate an alternative <div style={{height: 100vh}} />
// or else the first static page would not capture the entire screen's height and a FOUC would occur as soon as React takes over.
//
// * Forcing the client to replace it with a Div100vh
// The <div style={{height: 100vh}} /> returned by the server saved the client from creating a FOUC.
// But the client doesn't replace the server div with its own <Div100vh />.
// That's because both the server's <div /> and the client's <Div100vh /> produce the same tag (div) with the same prop (style),
// with that same prop having the very same key (height) with the very same value (in the first static page).
//
// I know hydration is supposed to add event callbacks regardless of equality, but I didn't want to take any chances,
// as a page slack would ruin the mobile app effect which is crucial.
//
// It's not easy to see if the hydration did add the event listener, but I did notice it did *not*'t change the div's ID;
// It didn't even change the ID when I populated the [server] state with the inBrowser() result;
// It changed it only when I forced the [server] state to start with a 'true' value;
// The browser then started with the (wrong) 'true' value then in useEffect changed it to 'false' and that change
// finally forced a re-render, making the div change its ID, and me confident this time that the event listener has been added.

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

const Viewport = ({ children, percent, server }) => {
  const unit = server ? 'vh' : 'rvh'

  console.log(`Viewport on the ${server ? 'server' : 'client'}`)
  const div100Style = { height: `${percent}${unit}`, width: '100%' }
  console.log('div100Style: ', div100Style)

  return server ? (
    <div style={div100Style}>{children}</div>
  ) : (
    <Div100vh style={div100Style}>{children}</Div100vh>
  )
}

const Page = ({ title, icon, noAppBar, noBack, children }) => {
  const appBarHeightPercent = noAppBar ? 0 : 10
  const mainHeightPercent = 100 - appBarHeightPercent
  // TODO: maybe 'server' needs to be a state
  const server = !inBrowser()

  return (
    <Viewport percent={100} server={server}>
      <Box pageVariant="content">
        <Viewport percent={appBarHeightPercent} server={server}>
          {!noAppBar && <MyAppBar {...{ title, icon, noBack }} />}
        </Viewport>
        <Viewport percent={mainHeightPercent} server={server}>
          <main style={{ height: '100%' }}>{children}</main>
        </Viewport>
        <SnackBar />
      </Box>
    </Viewport>
  )
}

export default Page
