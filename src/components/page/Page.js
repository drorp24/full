import React from 'react'
import { Box } from '../themed/Box'
import AppBar from './AppBar'

const Page = ({ title, children }) => (
  <Box pageVariant="container">
    <Box pageVariant="content">
      <AppBar title={title} />
      {children}
    </Box>
  </Box>
)

export default Page
