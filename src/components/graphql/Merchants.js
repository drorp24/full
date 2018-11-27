import React from 'react'
import { Query } from 'react-apollo'
import { gql } from 'apollo-boost'

const MERCHANTS = gql`
  query {
    merchants(
      searchArea: { lat: 32.05, lng: 34.77, distance: 50 }
      merchantServices: { currency: "CHF", delivery: true }
      searchResults: { results: 3 }
    ) {
      name
      address
      name_he
      delivery
      phone
    }
  }
`

export default () => (
  <Query query={MERCHANTS}>
    {({ loading, error, data }) => {
      if (loading) return <p>Loading...</p>
      if (error) return <p>Error :(</p>

      // console.log('data', data)
      // not destructuring to enable query to change w/o affecting this UI
      return data.merchants.map(merchant => (
        <div key={merchant.address}>
          <h3>{merchant.name}</h3>
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
