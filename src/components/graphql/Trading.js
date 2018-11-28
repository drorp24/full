import React from 'react'
import { Query } from 'react-apollo'
import { gql } from 'apollo-boost'

import trading from '../../queries/trading'

export default () => (
  <Query query={trading}>
    {({ loading, error, data }) => {
      if (loading) return <p>Loading...</p>
      if (error) return <p>Error :(</p>

      return data.trading.trading.map(({ coin, prices }) => (
        <div key={coin}>
          <h4>{coin} prices:</h4>
          {prices.map(({ currency, price }) => (
            <p key={currency}>
              {currency}: {price}
            </p>
          ))}
        </div>
      ))
    }}
  </Query>
)
