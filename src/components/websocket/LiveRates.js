import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { PropTypes } from 'prop-types'
import getSymbolFromCurrency from 'currency-symbol-map'
import NumberFormat from 'react-number-format'
import LinearProgress from '@material-ui/core/LinearProgress'
import { makeStyles } from '@material-ui/styles'

const LiveRates = ({ base, quote, quantity }) => {
  // This lazy form of useState is essential to avoid 429 responses (too many calls)
  const [websocket] = useState(
    () => new WebSocket('wss://ws-feed.pro.coinbase.com')
  )

  // 'subscribed' isn't used as neither websocket.x nor request are able to access it (See comments)
  const [_, setSubscribed] = useState(null) // eslint-disable-line no-unused-vars

  const [ticker, setTicker] = useState({
    product_id: null,
    price: null,
    direction: null,
  })

  // ? The unsubscribe paradox
  // ? TL;DR: unsubscribe requires calling useEffect with '[]', which prevents it from accessing state,
  // ? which forces you to call state update functional form only to access state, which is forbidden while unmounting
  // ? Update: after upgrading to CRA 3.0, I'm actually being yelled for leaving no depdendencies in useEffect ('[]').
  // ? Anyway seeing this '[]' thing being illegal all of a sudden stirs issue in the community, I just skipped this new eslint rule
  //
  // since useEffect can't provide 'pair's value to unsubscribe (see comment there), request has to come up with it
  // but simply accessing 'subscribed' will show empty value
  // maybe because caller useEffect calls 'request' only upon mounting, which makes 'request' capture the initial, empty 'subscribed' value
  // so in order to obtain the 'pair' value I'm wrapping everything in 'request' in a state update functional form
  // (same thing I did with websocket.onmessage, that had to access current price in order to populate direction)
  // but then I'm being yelled at for updating state while unmounting ('Can't perform a React state update on an unmounted component')
  // since there is no other way to access the current subscribed pair, I see no other way but to live with it!
  //
  // I may be missing something here, as unsubscribing typically requires using useEffect with '[]',
  // so if calling it with [] means its cleanup function wouldn't be able to access current state,
  // or make you compelled to update state only to obtain its value, which is forbidden upon unmounting,
  // then this would imply react hooks would have a serious flaw, which i find it hard to believe
  const request = (type, pair = null) => {
    setSubscribed(currSubscribed => {
      const product_ids = pair ? [pair] : currSubscribed

      const message = {
        type,
        channels: [
          {
            name: 'ticker',
            product_ids,
          },
        ],
      }

      websocket.send(JSON.stringify(message))

      return [pair]
    })
  }

  useEffect(() => {
    const pair = `${base}-${quote}`

    websocket.onopen = () => {
      request('subscribe', pair)
    }

    websocket.onmessage = response => {
      const data = JSON.parse(response.data)
      switch (data.type) {
        case 'subscriptions': {
          // console.log('Coinbase subscription message. Channels: ', data.channels)
          break
        }
        case 'ticker': {
          const { product_id, price } = data
          // console.log('Coinbase ticker message: ', product_id, price)
          if (product_id && price) {
            // using the functional form is the only way to get curr ticker's value. 'ticker' itself looks empty when accessed!
            setTicker(currTicker => ({
              product_id,
              price,
              direction: price > (currTicker.price || 0) ? 'up' : 'down',
            }))
          } else {
            console.log("ticker message doesn't include product_id && price")
          }
          break
        }
        case 'error': {
          const { message, reason } = data
          const error = `${message}: ${reason}`
          console.warn('Coinbase error message:', error)
          break
        }
        default: {
          console.log('Coinbase websocket unidentified data received: ', data)
        }
      }
    }

    websocket.onerror = response => {
      console.warn('Coinbase websocket error: ', response)
    }

    // without [], cleanup will be called after each render, not upon unmount
    // however calling useEffect upon mount & unmount only ([]) makes it unable to read up-to-date 'subscribed' value
    return () => {
      request('unsubscribe')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const { price, direction } = ticker
  const value = Number(price)

  return <Price {...{ value, quantity, direction, quote }} />
}

const Price = ({ value, quantity, direction = 'up', quote }) => {
  const { online } = useSelector(store => store.device)
  const useStyles = makeStyles(theme => ({
    upDown: {
      color: ({ direction }) => theme.form.header.liveRates[direction],
    },
    progress: {
      visibility: online ? 'visible' : 'hidden',
      width: '100%',
      backgroundColor: '#fff',
    },
  }))
  const classes = useStyles({ direction })

  return value ? (
    <NumberFormat
      value={value * quantity}
      displayType={'text'}
      thousandSeparator={true}
      decimalScale={2}
      fixedDecimalScale={true}
      prefix={getSymbolFromCurrency(quote)}
      className={classes.upDown}
    />
  ) : (
    <LinearProgress className={classes.progress} />
  )
}

LiveRates.propTypes = {
  base: PropTypes.string.isRequired,
  quote: PropTypes.string.isRequired,
  quantity: PropTypes.number.isRequired,
}

export default LiveRates
