import React, { useEffect, useState } from 'react'
import { coinbaseProducts } from '../forms/utilities/lists'
import { PropTypes } from 'prop-types'
import getSymbolFromCurrency from 'currency-symbol-map'
import NumberFormat from 'react-number-format'
import { useTheme } from '@material-ui/styles'
import LinearProgress from '@material-ui/core/LinearProgress'

const LiveRates = ({ get, pay, amount }) => {
  const pair = `${get}-${pay}`
  return coinbaseProducts.includes(pair) ? (
    <GetLiveRates {...{ pay, pair, amount }} />
  ) : (
    <span>&nbsp;</span>
  )
}

LiveRates.propTypes = {
  get: PropTypes.string.isRequired,
  pay: PropTypes.string.isRequired,
}

const GetLiveRates = ({ pay, pair, amount }) => {
  // This lazy form of useState is essential to avoid 429 responses (too many calls)
  const [websocket] = useState(
    () => new WebSocket('wss://ws-feed.pro.coinbase.com')
  )
  const [subscribed, setSubscribed] = useState(null)
  const [ticker, setTicker] = useState({
    product_id: null,
    price: null,
    direction: null,
  })

  const request = (type, pair) => {
    const message = {
      type,
      channels: [
        {
          name: 'ticker',
          product_ids: [pair],
        },
      ],
    }
    websocket.send(JSON.stringify(message))
    setSubscribed(type === 'subscribe' ? pair : null)
  }

  useEffect(() => {
    websocket.onopen = () => {
      if (subscribed) request('unsubscribe', subscribed)
      request('subscribe', pair)
    }

    websocket.onmessage = response => {
      const data = JSON.parse(response.data)
      const { type, product_id, price, message, reason } = data
      if (type === 'error') {
        const error = `${message}: ${reason}`
        console.warn('Coinbase error:', error)
        return
      }
      const direction = price > Number(ticker.price) ? 'up' : 'down'
      setTicker({ product_id, price, direction })
    }

    websocket.onerror = response => {
      console.warn('a websocket error occured: ', response)
    }
  })

  const theme = useTheme()
  const {
    primary: { main: pri },
    secondary: { main: sec },
  } = theme.palette

  const { price, direction } = ticker
  const paying = amount ? price * amount : null

  return price ? (
    <NumberFormat
      value={paying || price}
      displayType={'text'}
      thousandSeparator={true}
      decimalScale={2}
      fixedDecimalScale={true}
      prefix={getSymbolFromCurrency(pay)}
      style={{ color: direction === 'up' ? sec : pri }}
    />
  ) : (
    <LinearProgress style={{ width: '100%' }} />
  )
}

export default LiveRates
