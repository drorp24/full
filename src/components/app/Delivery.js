import React from 'react'
import { string } from 'yup'
import { useFormState, createSchema } from '../forms/utilities/formUtilities'
import FormContainer from '../forms/utilities/FormContainer'

const structure = [
  {
    submit: 'order',
    next: 'next',

    title: 'Some details please',
    subtitle: 'Please provide these details so we can proceed with delivery',
    fields: [
      {
        name: 'phone',
        type: 'phone',
        schema: string().required(),
        value: '',
        helper: 'My phone number',
        required: true,
        icon: 'ContactPhone',
      },
      {
        name: 'email',
        type: 'default',
        schema: string()
          .email('Valid email please')
          .required(),
        helper: 'My email address',
        required: true,
        icon: 'Email',
      },
      {
        name: 'address',
        type: 'default',
        schema: string().required(),
        helper: 'Delivery address',
        required: true,
        icon: 'HomeCity',
      },
      {
        name: 'time',
        type: 'time',
        schema: string(),
        value: new Date(),
        helper: 'Preferred delivery time',
        icon: 'Timetable',
      },
    ],
  },
]

const Delivery = () => {
  const [state, setState] = useFormState(structure)
  const schema = createSchema(structure)

  return (
    <FormContainer
      state={state}
      setState={setState}
      schema={schema}
      structure={structure}
    />
  )
}

export default Delivery
