// Improved VerticalStepper.js, extracting out
// - all atomic form components & functions into --> formUtilities.js
// - all stepper presentation logic into --> MultiStepForm.js
// enabling me to reuse each of these two separately
// Leaving this component to define the data and pass it as props to the other 2 components:
// - state: which data items are used
// - schema: rules of these items
// - content: arrangement of these items into one or several user steps
// Formik was deserted for the inability to access its state and/or pass it onto Formik
// My implementation is anyway better, passing ({state, schema, structure}) & letting Form do the rest 💪

import React, { useState } from 'react'
import { object, string, number, boolean } from 'yup'
import MultiStepForm from '../utilities/MultiStepForm'
import currencies from '../../../queries/currencies'

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
      ],
    },
    {
      label: 'How do you wish to get it',
      fields: [
        {
          name: 'delivery',
          type: 'text',
          helper: 'Would you require a delivery service',
        },
      ],
    },
    {
      label: 'Something else',
      fields: [{ name: 'delivery', type: 'checkbox' }],
    },
  ]

  return (
    <MultiStepForm
      state={state}
      setState={setState}
      schema={schema}
      structure={structure}
    />
  )
}
