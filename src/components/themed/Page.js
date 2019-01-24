import React from 'react'
import { Box } from './Box'

const Page = props => (
  <Box pgpadding="padding" pgheight="height">
    {props.children}
  </Box>
)

export default Page
