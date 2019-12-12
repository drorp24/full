import React from 'react'
import { Box } from '../themed/Box'
import Div100vh from 'react-div-100vh'
import MyAppBar from './MyAppBar'
import SnackBar from './Snackbar'

const Page = ({ title, icon, noAppBar, children }) => (
  <Div100vh>
    <Box pageVariant="content">
      {!noAppBar && <MyAppBar {...{ title, icon }} />}
      <main style={{ width: '100%', height: '100%' }}>{children}</main>
      <SnackBar />
    </Box>
  </Div100vh>
)

export default Page
