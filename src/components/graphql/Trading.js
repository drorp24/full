import React from 'react'
import { Query } from 'react-apollo'
import { gql } from 'apollo-boost'

const CURRENT_TRADING = gql`
  query {
    trading(coins: ["BTC", "ETC"], currencies: ["USD", "EUR"]) {
      time
      trading {
        coin
        prices {
          currency
          price
        }
      }
    }
  }
`

export default () => (
  <Query query={CURRENT_TRADING}>
    {({ loading, error, data }) => {
      if (loading) return <p>Loading...</p>
      if (error) return <p>Error :(</p>

      return data.trading.trading.map(({ coin, prices }) => (
        <div key={coin}>
          <h3>{coin} prices:</h3>
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
