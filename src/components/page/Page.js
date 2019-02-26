import React from 'react'
import { Box } from '../themed/Box'

const Page = ({ children }) => (
  <Box pageVariant="container">
    <Box pageVariant="content">{children}</Box>
  </Box>
)

export default Page
