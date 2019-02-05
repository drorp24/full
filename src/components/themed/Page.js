import React from 'react'
import { Box } from './Box'

const Page = ({ children }) => (
  <Box pgpadding="padding" pgheight="height">
    {children}
  </Box>
)

export default Page
