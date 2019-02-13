import React, { useEffect, useState } from 'react'
import { string, number } from 'yup'
import { useFormState, createSchema } from '../forms/utilities/formUtilities'
import FormContainer from '../forms/utilities/FormContainer'
import {
  getCurrencySymbol,
  payCurrencyOptions,
  cryptoCurrencies,
} from '../../queries/currencies'
import { getPositionAndAddress, address } from '../utility/geolocation'

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
        fetchList: cryptoCurrencies,
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
  window.schema = schema

  useEffect(() => {
    getPositionAndAddress(setState)
    createSchema(structure, setSchema)
  }, [])

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
