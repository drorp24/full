import React, { useState, useEffect } from 'react'
import { string } from 'yup'
import {
  useFormState,
  populateFormState,
} from '../forms/utilities/formUtilities'
import DotsMobileStepper from '../forms/utilities/DotsMobileStepper'

const Delivery = () => {
  const structure = [
    {
      title: 'Some details please',
      subtitle: 'Please provide these details so we can proceed with delivery',
      fields: [
        {
          name: 'phone',
          type: 'phone',
          value: '',
          schema: string().required(),
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
          helper: 'Delivery address',
          schema: string().required(),
          required: true,
          icon: 'HomeCity',
        },
        {
          name: 'time',
          type: 'time',
          value: new Date(),
          schema: string(),
          helper: 'Preferred delivery time',
          icon: 'Timetable',
        },
      ],
    },
  ]

  const [state, setState] = useFormState(structure)
  const [schema, setSchema] = useState({})

  // Removing [] created an endless loop; don't understand why
  useEffect(() => {
    populateFormState(structure, setState, setSchema)
  }, [])

  return (
    <div>
      <DotsMobileStepper
        state={state}
        setState={setState}
        schema={schema}
        structure={structure}
      />
    </div>
  )
}

export default Delivery
