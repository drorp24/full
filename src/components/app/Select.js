import React, { useEffect, useState } from 'react'
import { string, number } from 'yup'
import {
  useFormState,
  createSchema,
  setLists,
} from '../forms/utilities/formUtilities'
import FormContainer from '../forms/utilities/FormContainer'
import { getPositionAndAddress, address } from '../utility/geolocation'
import { mark } from '../utility/performance'
import LiveRates from '../websocket/LiveRates'
import Page from '../page/Page'
import { MyTypography } from '../themed/Box'

const structure = [
  {
    title: 'What are you buying',
    subtitle: 'Get the best offers',
    fields: [
      {
        name: 'payCurrency',
        type: 'autosuggest',
        list: 'currencies',
        update: 'coins',
        fieldSchema: string().required(),
        required: true,
        label: 'What are you paying with',
        helper: "The currency I'm paying with",
      },
      {
        name: 'getCurrency',
        type: 'autosuggest',
        list: 'coins',
        update: 'coins',
        fieldSchema: string().required('Please specify'),
        required: true,
        label: 'What are you looking for',
        helper: "The currency I'm buying",
      },
      {
        name: 'amount',
        type: 'number',
        fieldSchema: number()
          .required()
          // .min(10, 'Amount should be greater than 10')
          .typeError('Please fill in'),
        required: true,
        label: 'How much do you need',
        helper: 'The amount I need',
        clearable: true,
        // icon: getCurrencySymbol,
      },
      {
        name: 'center',
        type: 'location',
        value: address,
        fieldSchema: string().required('Please specify'),
        label: 'Where to look for offers',
        helper: 'Center the search here',
        clearable: true,
      },
      {
        name: 'delivery',
        type: 'switch',
        value: true,
        label: 'Delivery offers only',
        helper: 'Delivery offers only',
        required: true,
      },
      {
        name: 'lookaround',
        type: 'switch',
        value: true,
        label: 'Nearby offers only',
        helper: 'Nearby offers only',
        required: true,
      },
    ],
  },
]

const Select = () => {
  const [state, setState] = useFormState(structure)
  const [schema, setSchema] = useState({})

  window.state = state

  // TODO: setLists and createSchema should be performed in FormContainer, not by a caller like Select
  useEffect(() => {
    getPositionAndAddress(setState)
    // setLists should be re-called whenever either get- or payCurrency changes
    // but writing [state.values.payCurrency, ...get...] calls it for every keystroke
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

  const show = {
    helper: false,
    label: true,
    submit: 'get offers',
    next: 'next',
  }

  // TODO: header should also be rendreed in FormContainer not here
  const header = () => {
    const { title, subtitle } = structure[0]
    const { getCurrency: get, payCurrency: pay, amount } = state.values
    const selected = get && pay
    const getting = amount ? `${String(amount)} ${get}` : get
    return (
      <>
        <MyTypography component="div" formVariant="typography.title">
          {selected ? getting : title}
        </MyTypography>
        <MyTypography component="div" formVariant="typography.subtitle">
          {selected ? <LiveRates {...{ get, pay, amount }} /> : subtitle}
        </MyTypography>
      </>
    )
  }

  return (
    <Page title="Buy Crypto">
      <FormContainer
        {...{ state, setState, schema, structure, show, header }}
      />
    </Page>
  )
}

export default Select
