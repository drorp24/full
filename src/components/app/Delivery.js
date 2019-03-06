import React from 'react'
import { string } from 'yup'

import FormContainer from '../forms/utilities/FormContainer'
import Page from '../page/Page'

const structure = [
  {
    submit: 'order',
    next: 'next',

    title: 'Some details please',
    subtitle: 'So we can proceed with delivery',
    fields: [
      {
        name: 'phone',
        type: 'phone',
        fieldSchema: string().required(),
        value: '',
        helper: 'My phone number',
        required: true,
        icon: 'ContactPhone',
      },
      {
        name: 'email',
        type: 'default',
        fieldSchema: string()
          .email('Valid email please')
          .required(),
        helper: 'My email address',
        required: true,
        icon: 'Email',
      },
      {
        name: 'address',
        type: 'default',
        fieldSchema: string().required(),
        helper: 'Delivery address',
        required: true,
        icon: 'HomeCity',
      },
      {
        name: 'time',
        type: 'time',
        fieldSchema: string(),
        value: new Date(),
        helper: 'Preferred delivery time',
        icon: 'Timetable',
      },
    ],
  },
]

const Delivery = () => (
  <Page title="Delivery">
    <FormContainer structure={structure} show={{ next: 'next' }} />
  </Page>
)

export default Delivery
