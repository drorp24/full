import React from 'react'
import { string, number } from 'yup'
import FormContainer from '../forms/utilities/FormContainer'
import Page from '../page/Page'
import { address } from '../utility/geolocation'

const structure = [
  {
    title: 'What are you buying',
    subtitle: 'Get the best offers',
    fields: [
      {
        name: 'quote',
        type: 'autosuggest',
        list: 'currencies',
        update: 'coins',
        fieldSchema: string()
          .required()
          .matches(/^[^0-9]+$/, 'Please use letters')
          .length(3, 'Please enter the 3-letters code')
          .matches(/^[A-Z]{3}$/, 'Please use CAPITAL letters'),
        required: true,
        label: 'What are you paying with',
        helper: "The currency I'm paying with",
      },
      {
        name: 'base',
        type: 'autosuggest',
        list: 'coins',
        update: 'coins',
        fieldSchema: string()
          .required()
          .matches(/^[^0-9]+$/, 'Please use letters')
          .length(3, 'Please enter the 3-letters code')
          .matches(/^[A-Z]{3}$/, 'Please use CAPITAL letters only'),
        required: true,
        label: 'What are you looking for',
        helper: "The currency I'm buying",
      },
      {
        name: 'amount',
        type: 'number',
        fieldSchema: number()
          .required()
          // .min(10, 'Amount should be greater than 10')
          .typeError('Please fill in'),
        required: true,
        label: 'How much do you need',
        helper: 'The amount I need',
        clearable: true,
        // icon: baseSymbol,
      },
      {
        name: 'address',
        type: 'location',
        value: address,
        fieldSchema: string().required('Please specify'),
        label: 'Where to look for offers',
        helper: 'Center the search here',
        clearable: true,
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
  const show = {
    helper: false,
    label: true,
    submit: 'get offers',
    next: 'merchants',
  }

  return (
    <Page title="Get offers" icon="searchQuote">
      <FormContainer {...{ structure, show }} />
    </Page>
  )
}

export default Select
