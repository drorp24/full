import React, { useEffect } from 'react'
import { string } from 'yup'
import { useFormState, createSchema } from '../forms/utilities/formUtilities'
import FormContainer from '../forms/utilities/FormContainer'
import currencies from '../../queries/currencies'
import { getPositionAndAddress, address } from '../utility/geolocation'

const structure = [
  {
    submit: 'get offers',
    next: 'next',

    title: 'Looking for currency?',
    subtitle: 'Specify your needs and \n get the best offers around',
    fields: [
      {
        name: 'getCurrency',
        type: 'default',
        fieldSchema: string().required(),
        required: true,
        options: currencies,
        helper: "The currency I'm buying",
        icon: 'Cash',
      },
      {
        name: 'payCurrency',
        type: 'default',
        fieldSchema: string().required(),
        value: 'ILS',
        required: true,
        options: currencies,
        helper: "The currency I'm paying with",
        icon: 'Cash',
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
      {
        name: 'center',
        type: 'default',
        value: address,
        helper: 'Center the search here',
      },
      // {
      //   name: 'amount',
      //   type: 'number',
      //   schema: number()
      //     .required()
      //     .min(10, 'Amount should be bigger than 10')
      //     .typeError('Invalid number'),
      //   required: true,
      //   helper: 'The amount I need',
      //   icon: currencySymbol,
      // },
    ],
  },
]

const Select = () => {
  const [state, setState] = useFormState(structure)
  const schema = createSchema(structure)

  useEffect(() => {
    getPositionAndAddress(setState)
  }, [])

  return (
    <FormContainer
      state={state}
      setState={setState}
      schema={schema}
      structure={structure}
    />
  )
}

export default Select
