// // Old format, before useFormState custom hook and createSchema

// import React from 'react'
// import { string, number } from 'yup'
// import FormContainer from '../utilities/FormContainer'
// import { currencySymbol, baseOptions } from '../../../queries/currencies'
// import { useFormState, createSchema } from '../utilities/formUtilities'

// const structure = [
//   {
//     title: 'What do you need',
//     subtitle: 'What currency do you need, and how much of it?',
//     fields: [
//       {
//         name: 'currency',
//         type: 'default',
//         fieldSchema: string().required(),
//         required: true,
//         // value: 'USD',
//         options: baseOptions,
//         helper: 'Which currency do you wish to buy',
//         icon: 'Cash',
//       },
//       {
//         name: 'amount',
//         type: 'number',
//         fieldSchema: number()
//           .required()
//           .min(10)
//           .typeError('Invalid number'),
//         required: true,
//         helper: 'How much of that currency do you need',
//         icon: currencySymbol,
//       },
//       {
//         name: 'delivery',
//         type: 'switch',
//         value: true,
//         helper: "I'd like a delivery",
//         required: true,
//       },
//     ],
//   },
//   {
//     title: 'How would you like it',
//     subtitle: 'Would you rather pick it up yourself, or have it delivered?',
//     fields: [
//       {
//         name: 'phone',
//         type: 'phone',
//         fieldSchema: string().required(),
//         helper: 'My phone number',
//         required: true,
//         icon: 'ContactPhone',
//       },
//       {
//         name: 'email',
//         type: 'default',
//         fieldSchema: string()
//           .email('Please enter a valid email address')
//           .required(),
//         helper: 'My email address',
//         required: true,
//         icon: 'Email',
//       },
//       {
//         name: 'address',
//         type: 'default',
//         fieldSchema: string(),
//         helper: 'Delivery address',
//         required: true,
//         icon: 'HomeCity',
//       },
//       {
//         name: 'time',
//         type: 'time',
//         value: new Date(),
//         helper: 'Preferred delivery  time',
//         icon: 'Timetable',
//       },
//     ],
//   },
// ]

// export default function Wizard() {
//   const [state, setState] = useFormState(structure)
//   const schema = createSchema(structure)
//   window.state = state

//   const show = {
//     submit: 'finito!',
//     next: 'next',
//     helper: true,
//   }

//   return (
//     <FormContainer
//       state={state}
//       setState={setState}
//       schema={schema}
//       structure={structure}
//       show={show}
//     />
//   )
// }
