// import PageContent from './PageContent'
import React from 'react'
import { Box } from '../themed/Box'
import Div100vh from 'react-div-100vh'
import MyAppBar from './MyAppBar'
import SnackBar from './Snackbar'

// ! Dynamic parent must be defined outside the scope of its children
// Usually when a component is defined for the sake of one and only other component,
// it is simply defined inside that other component that needs it and used there.
// This is typically done when the defined component depends in some way on some condition
// and we don't want any conditionals inside a component tree, so we define the conditional part separeately.
//
// However in the below case, when I placed the definition of the conditioned EntirePageHeight inside Page,
// Page - and all of its content - re-rendered endlessly.
//
// The reason is that EntirePageHeight is depdendent on the Page's 'children' prop,
// but, at the same time, it *is* a part of Page's children's too
// so when it renders, it changes 'children' on which it is dependent, which makes it re-render again and so on.
//
// So if we want to define a parent component such as Page here, *and* we want to include in one of the layers
// a component *that depends on the children of what we're replacing* (Page here) then we need to define that
// children-dependent component outside the scope of the component we're defining (Page) to prevent an endless loop.
//
// Notice that EntirePageHeight's children prop are its own children
// When it was defined inside of Page I expected it to not be confusing its own children with Page's
// (which EntirePageHeight is one of) but that wasn't the case.
//
// * Div100vh is not active on the server
// The need for this condition stems from the fact that on the server, with no device or browser, Div100vh has no meaning
// The server in this case has to generate an alternative <div style={{height: 100vh}} />
// or else the first static page would not capture the entire screen's height and a FOUC would occur as soon as React takes over.
//
// Interestingly, when the server returns that <div style={{height: '100vh}}/>, React in that case
// doesn't "fix" it by replacing it with a <Div100vh /> as it does when the server attempts to return <Div100vh />

// ! display: contents instead of height: 100% width: 100%
// <main> tag below is added for screen readers (= to get Lighthouse 100 grade)
// But then it becomes an immediate child of Box, which being a flexbox defines rules for its immediate children
// The proper way to treat <main> as something semantic and apply the flex rule to its child where it is aimed
// is to make its display: 'content,' rather than making its height and width 100%.
//
// The extra div with height: '100%' on the child div is required for AutoSizer

const EntirePageHeight = ({ children }) =>
  process.env.REACT_APP_SERVER ? (
    <div style={{ height: '100vh' }}>{children}</div>
  ) : (
    <Div100vh>{children}</Div100vh>
  )

const Page = ({ title, icon, noAppBar, children }) => {
  return (
    <EntirePageHeight>
      <Box pageVariant="content">
        {!noAppBar && <MyAppBar {...{ title, icon }} />}
        <main style={{ display: 'contents' }}>
          <div style={{ height: '100%', width: '100%' }}>{children}</div>
        </main>
        <SnackBar />
      </Box>
    </EntirePageHeight>
  )
}

export default Page
