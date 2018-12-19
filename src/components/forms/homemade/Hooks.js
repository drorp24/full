// Multi-step form
// Using hooks

import React, { useState } from 'react'

export default function SearchForm() {
  const [state, setState] = useState({
    step: 1,
    values: {
      currency: 'USD',
      amount: 1000,
      delivery: false,
    },
  })

  // Unlike classes' setState, useState does not automatically merge update objects.
  // One can do that with spread syntax, provided setState's function form is used.
  const goToNext = e => {
    e.preventDefault()
    const { step } = state
    setState(state => {
      return { ...state, step: step + 1 }
    })
    console.log('goToNext after setState. New state: ', state)
  }

  const handleChange = e => {
    const { name, value } = e.target
    setState(state => {
      return { ...state, values: { ...state.values, [name]: value } }
    })
  }

  const handleSubmit = e => {
    e.preventDefault()
    console.log('Submitting values. state: ', state)
  }

  const { values } = state

  switch (state.step) {
    case 1:
      return (
        <ProductForm
          key="product"
          values={values}
          onChange={handleChange}
          onSubmit={goToNext}
        />
      )
    case 2:
      return (
        <DeliveryForm
          key="delivery"
          values={values}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      )
    default:
      return <p>Unknown step number!</p>
  }
}

const ProductForm = props => (
  <form onSubmit={props.onSubmit}>
    <h3>What do you need</h3>
    <input
      name="currency"
      type="text"
      placeholder="Currency"
      value={props.values.currency}
      onChange={props.onChange}
    />
    <input
      name="amount"
      type="text"
      placeholder="Amount"
      value={props.values.amount}
      onChange={props.onChange}
    />

    <button>Next</button>
  </form>
)

const DeliveryForm = props => (
  <form onSubmit={props.onSubmit}>
    <h3>How do you want it delivered</h3>
    <input
      name="delivery"
      type="text"
      placeholder="Delivery"
      value={props.values.delivery}
      onChange={props.onChange}
    />

    <button>Search</button>
  </form>
)
