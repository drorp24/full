import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setValue } from '../../../redux/actions'

import { makeStyles } from '@material-ui/styles'

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
    firstLine = 'I am...'
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

  // ! theme should hold only generic stuff
  // MUI's variant capabilities are great, but playing with them, I did the mistake of
  // inserting component-specific rules into theme, almost turning it into a general CSS,
  // the kind we don't need anymore thanks to side by side component / css-in-JS.
  // Here it's manifested by the 'formVariant' which sends this component to the theme,
  // looking for its very specific, non-theme rules rather than define them here.
  // Don't do that anymore but won't migrate what I already put in them back into components either.

  const useStyles = makeStyles(theme => ({
    firstLine: {
      textTransform: base ? 'uppercase' : 'unset',
      letterSpacing: base ? '0.2rem' : 'unset',
      textAlign: 'center',
    },
    secondLine: {
      letterSpacing: '0.1rem',
    },
  }))

  const classes = useStyles()

  return (
    <MyTypography component="div" formVariant="typography.header">
      <MyTypography
        component="div"
        formVariant="typography.title"
        className={classes.firstLine}
      >
        {firstLine}
      </MyTypography>
      <MyTypography
        component="div"
        formVariant="typography.subtitle"
        className={classes.secondLine}
      >
        {secondLine}
      </MyTypography>
    </MyTypography>
  )
}

export default LiveHeader
