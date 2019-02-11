import React, { useEffect } from 'react'
import Page from '../themed/Page'
import LocationSearchInput from '../forms/utilities/LocationSearchInput'
import { createClient } from '@google/maps'

const Try = () => {
  useEffect(() => {
    // Didn't work
    // const googleMapsClient = createClient({
    //   key: process.env.GOOGLE_API_KEY,
    //   Promise: Promise,
    // })
  })
  return (
    <Page>
      <LocationSearchInput />
    </Page>
  )
}
Try.propTypes = {}

export default Try
