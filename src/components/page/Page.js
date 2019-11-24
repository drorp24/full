import React from 'react'
import { Box } from '../themed/Box'
import Div100vh from 'react-div-100vh'
import MyAppBar from './MyAppBar'
import SnackBar from './Snackbar'

const Page = ({ title, icon, children }) => (
  <Div100vh>
    <Box pageVariant="content">
      <MyAppBar {...{ title, icon }} />
      {children}
      <SnackBar />
    </Box>
  </Div100vh>
)

export default Page
