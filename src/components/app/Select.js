import React, { useEffect } from 'react'
import { string, number } from 'yup'
import { useFormState, createSchema } from '../forms/utilities/formUtilities'
import FormContainer from '../forms/utilities/FormContainer'
import currencies, { getCurrencySymbol } from '../../queries/currencies'
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
        options: currencies,
        helper: "The currency I'm buying",
      },
      {
        name: 'payCurrency',
        type: 'default',
        fieldSchema: string().required(),
        value: 'ILS',
        required: true,
        options: currencies,
        helper: "The currency I'm paying with",
      },
      {
        name: 'center',
        type: 'default',
        value: address,
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
        helper: 'The amount I need',
        icon: getCurrencySymbol,
      },
      {
        name: 'delivery',
        type: 'switch',
        value: true,
        helper: 'Delivery offers only',
        required: true,
      },
      {
        name: 'lookaround',
        type: 'switch',
        value: true,
        helper: 'Nearby merchants only',
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
