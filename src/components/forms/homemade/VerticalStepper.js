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
    currency: string()
      .required()
      .min(3)
      .max(3)
      .matches(/(USD|EUR)/, 'Sorry, only EUR and USD are currently supported'),
    amount: number('Please specify amount of required currency!')
      .required('Amount is required!')
      .min(0, 'Amount should be greater than zero!')
      .positive('Amount should be positive!'),
    delivery: boolean(),
  })

  // This the only place mapping each form/step to its content!
  const structure = [
    {
      label: 'What do you need',
      fields: [
        { name: 'currency', type: 'text' },
        { name: 'amount', type: 'number' },
      ],
    },
    {
      label: 'How do you want to get it',
      fields: [{ name: 'delivery', type: 'text' }],
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
