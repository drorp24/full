import React, { useEffect } from 'react'
import { string, number } from 'yup'
import { useFormState, createSchema } from '../forms/utilities/formUtilities'
import FormContainer from '../forms/utilities/FormContainer'
import {
  getCurrencySymbol,
  getCurrencyOptions,
  payCurrencyOptions,
} from '../../queries/currencies'
import { getPositionAndAddress, address } from '../utility/geolocation'

const structure = [
  {
    title: 'Looking for currency?',
    subtitle: 'Specify your requirement and \n get the best offers around',
    fields: [
      {
        name: 'getCurrency',
        type: 'default',
        fieldSchema: string().required(),
        required: true,
        options: getCurrencyOptions,
        label: 'What currency are you buying',
        helper: "The currency I'm buying",
      },
      {
        name: 'payCurrency',
        type: 'default',
        fieldSchema: string().required(),
        value: 'ILS',
        required: true,
        options: payCurrencyOptions,
        label: 'What currency you are paying with',
        helper: "The currency I'm paying with",
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
  const schema = createSchema(structure)
  window.state = state

  useEffect(() => {
    getPositionAndAddress(setState)
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
