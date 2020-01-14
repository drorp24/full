import React from 'react'
import { useSelector } from 'react-redux'

import LiveRates from '../../websocket/LiveRates'
import { coinbaseProducts } from './lists'
import { MyTypography } from '../../themed/Box'

const LiveHeader = props => {
  const { base, quote, amount } = useSelector(store => store.form.values)
  const lists = useSelector(store => store.lists)

  const selected = base && quote
  const quantity = amount || 1
  const coin =
    (
      (selected &&
        lists.coins &&
        lists.coins.find(coin => coin.name === base)) ||
      {}
    ).display || base

  const getting = amount ? `${String(amount)} ${coin}` : coin
  const firstLine = selected ? getting : 'What are you looking for?'

  const liveRatesExist =
    selected && coinbaseProducts.includes(`${base}-${quote}`)
  const secondLine = liveRatesExist && (
    <LiveRates {...{ base, quote, quantity }} />
  )

  return (
    <MyTypography component="div" formVariant="typography.header">
      <MyTypography
        component="div"
        formVariant={selected ? 'typography.coinTitle' : 'typography.title'}
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
