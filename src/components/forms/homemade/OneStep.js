// One step, plain-old settings / search form
// Using the tools I've made
// Let's see how easy or hard it is to create a different looking form with the same data & rules
import React, { useState } from 'react'
import { object, string, number, boolean } from 'yup'
import currencies from '../../../queries/currencies'
import { Form } from '../utilities/formUtilities'
import Page from '../../themed/Page'

export default function SearchForm() {
  const [state, setState] = useState({
    values: {
      currency: 'USD',
      amount: 1000,
      delivery: false,
    },
    touched: {
      currency: false,
      amount: false,
      delivery: false,
    },
    errors: {
      currency: null,
      amount: null,
      delivery: null,
    },
  })

  const schema = object().shape({
    currency: string(),
    amount: number()
      .required()
      .min(10)
      .typeError('Invalid number'),
    delivery: boolean(),
  })

  // This the only place mapping each form/step to its content!
  const structure = [
    {
      label: 'What do you need',
      fields: [
        {
          name: 'currency',
          type: 'text',
          required: true,
          options: currencies,
          helper: 'Which currency do you wish to buy',
        },
        {
          name: 'amount',
          type: 'number',
          required: true,
          helper: 'How much of that currency do you need',
        },
        {
          name: 'delivery',
          type: 'text',
          helper: 'Would you require a delivery service',
        },
      ],
    },
  ]

  return (
    <Page>
      <Form
        state={state}
        setState={setState}
        schema={schema}
        structure={structure}
        step={0}
      />
    </Page>
  )
}
