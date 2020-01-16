import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setValue } from '../../../redux/actions'

import LiveRates from '../../websocket/LiveRates'
import { coinbaseProducts } from './lists'
import { MyTypography } from '../../themed/Box'

const LiveHeader = props => {
  const { base, quote, amount } = useSelector(store => store.form.values || {})
  const lists = useSelector(store => store.lists)

  let firstLine
  if (base) {
    const coin =
      ((lists.coins && lists.coins.find(coin => coin.name === base)) || {})
        .display || base
    firstLine = amount ? `${String(amount)} ${coin}` : coin
  } else if (quote) {
    firstLine =
      (
        (lists.currencies &&
          lists.currencies.find(currency => currency.name === quote)) ||
        {}
      ).display || quote
  } else {
    firstLine = 'What are you looking for?'
  }

  const liveRatesExist =
    base && quote && coinbaseProducts.includes(`${base}-${quote}`)
  const quantity = amount || 1
  const secondLine = liveRatesExist && (
    <LiveRates {...{ base, quote, quantity }} />
  )

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(setValue({ type: 'SET_APP', key: 'scrolling', value: null }))
  }, [dispatch])

  return (
    <MyTypography component="div" formVariant="typography.header">
      <MyTypography
        component="div"
        formVariant="typography.title"
        style={
          base ? { textTransform: 'uppercase', letterSpacing: '0.3em' } : {}
        }
      >
        {firstLine}
      </MyTypography>
      <MyTypography component="div" formVariant="typography.subtitle">
        {secondLine}
      </MyTypography>
    </MyTypography>
  )
}

export default LiveHeader
