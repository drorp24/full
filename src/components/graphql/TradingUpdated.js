import React from 'react'
import { Subscription } from 'react-apollo'
import merge from 'lodash.merge'

import tradingUpdated from '../../queries/tradingUpdated'

let myPrevPrices = {} // useState not used since setPrevPrices created a recursion
let color, currencyPrice, addedCurrency

export default () => (
  <Subscription subscription={tradingUpdated}>
    {({ loading, error, data }) => {
      if (loading) return <p>Loading...</p>
      if (error) return <p>Error :(</p>

      return data.tradingUpdated.trading.map(({ coin, prices }) => (
        <div key={coin}>
          <h4>{coin} prices:</h4>
          {prices.map(({ currency, price }) => {
            color =
              myPrevPrices[coin] && price < myPrevPrices[coin][currency]
                ? 'red'
                : 'green'

            currencyPrice = {}
            currencyPrice[currency] = price
            addedCurrency = {}
            addedCurrency[coin] = currencyPrice
            myPrevPrices = merge(myPrevPrices, addedCurrency)

            return (
              <p key={currency} style={{ color }}>
                {currency}: {price}
              </p>
            )
          })}
        </div>
      ))
    }}
  </Subscription>
)
