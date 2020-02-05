// ! Deserted:
// The macro you imported from "undefined" is being executed outside the context of compilation with babel-plugin-macros.
//
import React from 'react'
import preval from 'preval.macro'

// * Build Data
// Stamps a built /welcome page with the time it was built so it can be compared against the active page.
// REACT_APP_ENV_FILE === '.env.production' ensures that it would be shown in localhost and hidden (but existent) in production
// and process.env.REACT_APP_SERVER ensures that client rendering doesn't override what the server recorded here.
const BuildData = () => {
  const visibility =
    process.env.REACT_APP_ENV_FILE === '.env.production' ? 'visible' : 'hidden'
  return (
    <span style={{ visibility }}>
      {process.env.REACT_APP_SERVER &&
        preval`module.exports = new Date().toLocaleString('en-US',{dateStyle: 'medium', timeStyle: 'short', hour12: false});`}
    </span>
  )
}

export default BuildData
