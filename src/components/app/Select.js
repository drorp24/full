import React from 'react'
import { string, number } from 'yup'
import FormContainer from '../forms/utilities/FormContainer'
import Page from '../page/Page'
import { address } from '../utility/geolocation'

const structure = [
  {
    title: 'What are you looking for?',
    // subtitle: 'Get the best offers',
    fields: [
      {
        name: 'quote',
        type: 'autosuggest',
        list: 'currencies',
        update: 'coins',
        fieldSchema: string()
          .required()
          .matches(/^[^0-9]+$/, 'Please use letters')
          .length(3, 'Enter 3-letter code or select from the list')
          .matches(/^[A-Z]{3}$/, 'Please use CAPITAL letters'),
        required: true,
        label: 'Paying with',
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
          .length(3, 'Enter 3-letter code or select from the list')
          .matches(/^[A-Z]{3}$/, 'Please use CAPITAL letters only'),
        required: true,
        label: 'Buying coin',
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
        label: 'Need this amount',
        helper: 'The amount I need',
        clearable: true,
        // icon: baseSymbol,
      },
      {
        name: 'address',
        type: 'location',
        value: address,
        fieldSchema: string().required('Please specify'),
        label: 'Prefer searching around',
        helper: 'Center the search here',
        clearable: true,
      },
      {
        name: 'delivery',
        type: 'switch',
        value: false,
        label: 'Require delivery',
        helper: 'Delivery offers only',
        required: true,
      },
      // {
      //   name: 'lookaround',
      //   type: 'switch',
      //   value: true,
      //   label: 'Nearby offers only',
      //   helper: 'Nearby offers only',
      //   required: true,
      // },
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
    <Page title="Find offers" icon="searchQuote" noBack>
      <FormContainer {...{ structure, show }} />
    </Page>
  )
}

export default Select
