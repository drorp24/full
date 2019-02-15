import React, { useEffect, useState } from 'react'
import { string, number } from 'yup'
import {
  useFormState,
  createSchema,
  setLists,
} from '../forms/utilities/formUtilities'
import FormContainer from '../forms/utilities/FormContainer'
import { getCurrencySymbol, payCurrencyOptions } from '../../queries/currencies'
import { getPositionAndAddress, address } from '../utility/geolocation'
import { mark } from '../utility/performance'

const structure = [
  {
    title: 'Looking for crypto?',
    subtitle: "Select the coin you're after \n and  get the best offers around",
    fields: [
      {
        name: 'payCurrency',
        type: 'autosuggest',
        list: 'currencies',
        update: 'coins',
        fieldSchema: string().required(),
        required: true,
        label: 'What currency you are paying with',
        helper: "The currency I'm paying with",
      },
      {
        name: 'getCurrency',
        type: 'autosuggest',
        list: 'coins',
        update: 'coins',
        fieldSchema: string().required('Please specify'),
        required: true,
        label: 'What coin are you looking for',
        helper: "The currency I'm buying",
      },
      {
        name: 'center',
        type: 'default',
        value: address,
        label: 'Where to search for offers',
        helper: 'Center the search here',
      },
      {
        name: 'amount',
        type: 'number',
        fieldSchema: number()
          .required()
          .min(10, 'Amount should be bigger than 10')
          .typeError('Invalid number'),
        required: true,
        label: 'How much do you need',
        helper: 'The amount I need',
        icon: getCurrencySymbol,
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
  window.setState = setState // setState in Chrome and see if the proper useEffect is called!
  window.schema = schema

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

  return (
    <FormContainer
      state={state}
      setState={setState}
      schema={schema}
      structure={structure}
      show={show}
    />
  )
}

export default Select
