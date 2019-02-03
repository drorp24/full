import React, { useState } from 'react'
import { object, string, number, boolean } from 'yup'
import DotsMobileStepper from '../utilities/DotsMobileStepper'
import currencies, { currencySymbol } from '../../../queries/currencies'

export default function SearchForm() {
  // TODO: leave only values and calculate touched and errors
  const [state, setState] = useState({
    values: {
      currency: 'USD',
      amount: '1000',
      delivery: true,
      phone: '+972',
      email: '',
      address: '',
      // date: '',
      time: new Date(),
    },
    touched: {
      currency: false,
      amount: false,
      delivery: false,
      phone: false,
      email: false,
      address: false,
      // date: false,
      time: false,
    },
    errors: {
      currency: false,
      amount: false,
      delivery: false,
      phone: true,
      email: true,
      address: true,
      // date: true,
      time: true,
    },
  })

  const schema = object().shape({
    currency: string().required(),
    amount: number()
      .required()
      .min(10)
      .typeError('Invalid number'),
    delivery: boolean(),
    phone: string().required(),
    email: string()
      .email('Please enter a valid email address')
      .required(),
    address: string(),
    // date: string(),
    time: string(),
  })

  window.state = state
  window.schema = schema

  // 'type' indicates the component and its onChange signature, it's not a form type (e.g., email: 'default')
  const structure = [
    {
      title: 'What do you need',
      subtitle: 'What currency do you need, and how much of it?',
      fields: [
        {
          name: 'currency',
          type: 'default',
          required: true,
          options: currencies,
          helper: 'Which currency do you wish to buy',
          icon: 'Cash',
        },
        {
          name: 'amount',
          type: 'number',
          required: true,
          helper: 'How much of that currency do you need',
          icon: currencySymbol,
        },
      ],
    },
    {
      title: 'How would you like it',
      subtitle: 'Would you rather pick it up yourself, or have it delivered?',
      fields: [
        {
          name: 'delivery',
          type: 'switch',
          helper: "I'd like a delivery",
          required: true,
        },
        {
          name: 'phone',
          type: 'phone',
          helper: 'My phone number',
          required: true,
          icon: 'ContactPhone',
        },
        {
          name: 'email',
          type: 'default',
          helper: 'My email address',
          required: true,
          icon: 'Email',
        },
        {
          name: 'address',
          type: 'default',
          helper: 'Delivery address',
          required: true,
          icon: 'HomeCity',
        },
        // {
        //   name: 'date',
        //   type: 'text',
        //   helper: 'When would you like to get it',
        // },
        {
          name: 'time',
          type: 'time',
          helper: 'I prefer delivery at this time of day',
          icon: 'Timetable',
        },
      ],
    },
  ]

  window.structure = structure

  return (
    <DotsMobileStepper
      state={state}
      setState={setState}
      schema={schema}
      structure={structure}
    />
  )
}
