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
import { getCoins } from '../forms/utilities/lists'

const structure = [
  {
    title: 'Looking for crypto?',
    subtitle: "Select the coin you're after \n and  get the best offers around",
    fields: [
      {
        name: 'payCurrency',
        type: 'default',
        fieldSchema: string().required(),
        required: true,
        options: payCurrencyOptions,
        label: 'What currency you are paying with',
        helper: "The currency I'm paying with",
      },
      {
        name: 'getCurrency',
        type: 'autosuggest',
        list: 'coins',
        fetchList: getCoins,
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
    console.log('useEffect getPosition/SetLists called')
    getPositionAndAddress(setState)
    // setLists should be re-called whenever either get- or payCurrency changes
    // but writing [state.values.payCurrency, ...get...] will make it get called every keystroke
    // so instead of using the useEffect [] mechanism I manually trigger it upon field blurring
    setLists(structure, setState)
  }, [])

  useEffect(() => {
    // state.coin on the other hand is changed at once
    // I should setState in chrome and see if it triggers this useEffect
    console.log(
      'useEffect createSchema called. state.coins.length at that point:',
      state.coins && state.coins.length
    )
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
