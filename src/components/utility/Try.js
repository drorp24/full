import React, { useEffect, useState } from 'react'
import Page from '../themed/Page'
import { getCurrentPosition, getAddress } from './geolocation'

const Try = () => {
  const [geolocation, setGeolocation] = useState({
    position: null,
    address: null,
    error: null,
  })

  async function getPositionAndAddress() {
    try {
      const position = await getCurrentPosition()
      setGeolocation(geolocation => ({ ...geolocation, position }))
      const address = await getAddress(position)
      setGeolocation(geolocation => ({ ...geolocation, address }))
    } catch (error) {
      setGeolocation(geolocation => ({
        ...geolocation,
        error: error.toString(),
      }))
    }
  }

  useEffect(() => {
    getPositionAndAddress()
  })

  return (
    <Page>
      <h3>Position</h3>
      {geolocation.position ? (
        <>
          <div>{geolocation.position.coords.latitude}</div>
          <div>{geolocation.position.coords.longitude}</div>
          <div>{geolocation.address}</div>
          <div>{geolocation.error}</div>
        </>
      ) : (
        <div>No position</div>
      )}
    </Page>
  )
}

Try.propTypes = {}

export default Try
