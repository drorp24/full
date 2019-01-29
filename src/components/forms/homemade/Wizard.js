import React, { useState } from 'react'
import { object, string, number, boolean } from 'yup'
import DotsMobileStepper from '../utilities/DotsMobileStepper'
import currencies from '../../../queries/currencies'

export default function SearchForm() {
  const [state, setState] = useState({
    values: {
      currency: 'USD',
      amount: 1000,
      delivery: true,
      phone: '+972',
      email: '',
      address: '',
      entry: '',
      floor: '',
      apartment: '',
    },
    touched: {
      currency: false,
      amount: false,
      delivery: false,
      phone: false,
      email: false,
      address: false,
      entry: false,
      floor: false,
      apartment: false,
    },
    errors: {
      currency: null,
      amount: null,
      delivery: null,
      phone: true,
      email: true,
      address: true,
      entry: true,
      floor: true,
      apartment: true,
    },
  })

  const schema = object().shape({
    currency: string(),
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
    entry: string(),
    floor: string(),
    apartment: string(),
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
      title: 'How do you want to get it',
      subtitle:
        'If you require delivery, please let us know how we can contact you',
      fields: [
        {
          name: 'delivery',
          type: 'checkbox',
          helper: 'Would you require a delivery service',
          required: true,
        },
        {
          name: 'phone',
          type: 'phone',
          helper: 'Your phone number',
          required: true,
        },
        {
          name: 'email',
          type: 'email',
          helper: 'Your email address',
          required: true,
        },
      ],
    },
    {
      title: 'Where do you want to get it',
      subtitle:
        "Let us know where to deliver to and we'll notify you of the time",
      fields: [
        {
          name: 'address',
          type: 'phone',
          helper: 'Your phone number',
          required: true,
        },
        {
          name: 'entry',
          type: 'text',
          helper: 'House entry',
        },
        {
          name: 'floor',
          type: 'text',
          helper: 'Floor',
        },
        {
          name: 'apartment',
          type: 'text',
          helper: 'Apartment',
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
