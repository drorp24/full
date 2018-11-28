import React from 'react'
import { Query } from 'react-apollo'

import merchants from '../../queries/merchants'

export default () => (
  <Query query={merchants}>
    {({ loading, error, data }) => {
      if (loading) return <p>Loading...</p>
      if (error) return <p>Error :(</p>

      // console.log('data', data)
      // not destructuring to enable query to change w/o affecting this UI
      return data.merchants.map(merchant => (
        <div key={merchant.address}>
          <h4>{merchant.name}</h4>
          {Object.entries(merchant).map(
            ([key, value]) =>
              key !== '__typename' && (
                <p key={key}>
                  {key}: {value}
                </p>
              )
          )}
        </div>
      ))
    }}
  </Query>
)
