import React, { useState } from 'react'
import { Subscription } from 'react-apollo'
import merge from 'lodash.merge'

import tradingUpdated from '../../queries/tradingUpdated'

export default () => {
  // not used since setPrevPrices created a recursion
  const [prevPrices, setPrevPrices] = useState({
    BTC: { EUR: 0, USD: 0 },
    ETH: { EUR: 0, USD: 0 },
  })

  let myPrevPrices = {}
  let color
  const result = (
    <Subscription subscription={tradingUpdated}>
      {({ loading, error, data }) => {
        if (loading) return <p>Loading...</p>
        if (error) return <p>Error :(</p>

        // console.log('data: ', data)

        // console.log('myPrevPrices initially: ', myPrevPrices)
        // chrome dev console doesn't show the value at run time but at some eventual moment (like it does for promise)
        // that check proves the initial value was indeed zero at run time
        // console.log(
        //   'myPrevPrices.BTC.EUR === 0 ?',
        //   myPrevPrices['BTC'] && myPrevPrices['BTC']['EUR'] === 0
        // )
        // console.log('myPrevPrices right after initializing: ', myPrevPrices)
        // console.log('myPrevPrices:', myPrevPrices)
        return data.tradingUpdated.trading.map(({ coin, prices }) => {
          // console.log(`new coin ${coin}. myPrevPrices: `, myPrevPrices)
          // if (!myPrevPrices[coin]) myPrevPrices[coin] = {}
          // coin = coin.toLowerCase()
          return (
            <div key={coin}>
              <h4>{coin} prices:</h4>
              {prices.map(({ currency, price }) => {
                // console.log('price:', price)
                // console.log('coin: ', coin)
                // console.log('currency: ', currency)
                // console.log('myPrevPrices[coin]:', myPrevPrices[coin])
                // console.log(
                //   'myPrevPrices[coin][currency]:',
                //   myPrevPrices[coin] && myPrevPrices[coin][currency]
                // )
                // console.log(
                //   'myPrevPrices[coin][EUR]:',
                //   myPrevPrices[coin] && myPrevPrices[coin]['EUR']
                // )
                // console.log(
                //   'myPrevPrices[coin][USD]:',
                //   myPrevPrices[coin] && myPrevPrices[coin]['USD']
                // )
                // console.log(
                //   'myPrevPrices[coin].EUR:',
                //   myPrevPrices[coin] && myPrevPrices[coin].EUR
                // )
                // console.log(
                //   'myPrevPrices[coin].USD:',
                //   myPrevPrices[coin] && myPrevPrices[coin].USD
                // )
                // console.log(
                //   'price < myPrevPrices[coin][currency]:',
                //   myPrevPrices[coin] && price < myPrevPrices[coin][currency]
                // )
                color =
                  myPrevPrices[coin] && price < myPrevPrices[coin][currency]
                    ? 'red'
                    : 'green'

                var currencyPrice = {}
                currencyPrice[currency] = price
                var addedCurrency = {}
                addedCurrency[coin] = currencyPrice
                // console.log('added: ', addedCurrency)
                myPrevPrices = merge(myPrevPrices, addedCurrency)
                // console.log('after assignment. myPrevPrices:', myPrevPrices)

                return (
                  <p key={currency} style={{ color }}>
                    {currency}: {price}
                  </p>
                )
              })}
            </div>
          )
        })
      }}
    </Subscription>
  )

  return result
}
