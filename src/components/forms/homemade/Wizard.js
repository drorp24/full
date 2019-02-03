import React, { useState } from 'react'
import { object, string, number, boolean } from 'yup'
import DotsMobileStepper from '../utilities/DotsMobileStepper'
import currencies, { currencySymbol } from '../../../queries/currencies'

export default function SearchForm() {
  const [state, setState] = useState({
    values: {
      currency: '',
      amount: '',
      delivery: true,
      phone: '+972',
      email: '',
      address: '',
      // date: '',
      time: '',
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
      currency: true,
      amount: true,
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

  const structure = [
    {
      title: 'What do you need',
      subtitle: 'What currency do you need and how much',
      fields: [
        {
          name: 'currency',
          type: 'text',
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
      title: 'How would you like to get it',
      subtitle:
        'Would you rather pick it up yourself or have it delivered to you',
      fields: [
        {
          name: 'delivery',
          type: 'switch',
          helper: 'Have it delivered to me',
          required: true,
        },
        {
          name: 'phone',
          type: 'phone',
          helper: 'Your phone number',
          required: true,
          icon: 'ContactPhone',
        },
        {
          name: 'email',
          type: 'email',
          helper: 'Your email address',
          required: true,
          icon: 'Email',
        },
        {
          name: 'address',
          type: 'text',
          helper: 'Street address',
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
          type: 'text',
          helper: 'What delivery time would suit you best',
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
