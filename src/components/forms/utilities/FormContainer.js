import React, { useEffect, useState } from 'react'
import DotsMobileStepper from './DotsMobileStepper'
import OneStepper from './OneStepper'
import {
  useFormState,
  createSchema,
  setLists,
} from '../../forms/utilities/formUtilities'
import { getPositionAndAddress } from '../../utility/geolocation'
import { mark } from '../../utility/performance'
import LiveRates from '../../websocket/LiveRates'
import { MyTypography } from '../../themed/Box'
import { coinbaseProducts } from '../../forms/utilities/lists'

const FormContainr = ({ structure, show }) => {
  const [state, setState] = useFormState(structure)
  const [schema, setSchema] = useState({})

  window.state = state
  window.setState = setState

  const header = () => {
    const { title, subtitle } = structure[0]
    const { base, quote, amount } = state.values
    const quantity = amount || 1
    const selected = base && quote
    const getting = amount ? `${String(amount)} ${base}` : base
    return (
      <>
        <MyTypography component="div" formVariant="typography.title">
          {selected ? getting : title}
        </MyTypography>
        <MyTypography component="div" formVariant="typography.subtitle">
          {selected && coinbaseProducts.includes(`${base}-${quote}`) ? (
            <LiveRates {...{ base, quote, quantity }} />
          ) : (
            subtitle
          )}
        </MyTypography>
      </>
    )
  }

  useEffect(() => {
    getPositionAndAddress(setState)
    // setLists should be re-called whenever either base or quote changes
    // but writing [state.values.quote, ...base...] calls it for every keystroke
    // so instead of using the useEffect [] mechanism I manually trigger it upon field blurring
    setLists(structure, setState)
  }, [])

  useEffect(() => {
    // This useEffect is automatically triggered as soon as coins are firstly populated (which is good)
    // and also whenever coins list is modified (which is bad, as it's only the rates which would get modified)
    // However writing [state.coins && state.coins.map(coin => coin.name) made it loop infinitley.
    mark('state.coins useEffect called')
    createSchema(structure, state, setSchema)
  }, [state.coins])

  const properties = {
    structure,
    state,
    setState,
    schema,
    show,
    header,
  }

  return structure.length > 1 ? (
    <DotsMobileStepper {...properties} />
  ) : (
    <OneStepper {...properties} />
  )
}

export default FormContainr
