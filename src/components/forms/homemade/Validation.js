// Multi-step hooks form
// With validations
// With routing
// TODO: [DONE]router , debug, Yup

import React, { useState } from 'react'
import { Route, Redirect, Switch, Link } from 'react-router-dom'
import Debug from '../../utility/Debug'

export default function SearchForm() {
  const forms = {
    product: ['currency', 'amount'],
    service: ['delivery'],
  }

  const [state, setState] = useState({
    values: {
      currency: 'USD',
      amount: '',
      delivery: false,
    },
    touched: {
      currency: false,
      amount: false,
      delivery: false,
    },
  })

  const isValid = field => {
    switch (field) {
      case 'currency':
        return !!state.values[field]
      case 'amount':
        return !!state.values[field]
      case 'delivery':
        return !!state.values[field]
      default:
        return false
    }
  }

  const validate = formName => {
    let validated = {}
    const fields = forms[formName]
    fields.forEach(field => {
      validated[field] = isValid(field)
    })
    validated.form = !Object.values(validated).includes(false)
    return validated
  }

  const errorIn = field => state.touched[field] && !validated[field]

  // Unlike classes' setState, useState does not automatically merge update objects.
  // One can do that with spread syntax, provided setState's function form is used.
  const handleBlur = e => {
    const { name } = e.target
    setState(state => {
      return { ...state, touched: { ...state.touched, [name]: true } }
    })
  }

  const handleChange = e => {
    const { name, value } = e.target
    setState(state => {
      return {
        ...state,
        values: { ...state.values, [name]: value },
        touched: { ...state.touched, [name]: true },
      }
    })
  }

  const doNothing = e => {
    e.preventDefault()
    console.log('Step form submitted - doing nothing')
  }

  const handleSubmit = e => {
    e.preventDefault()
    console.log('Submitting values. state: ', state)
  }

  const errorStyle = { borderWidth: '1', borderColor: 'red' }
  const disabledLink = { pointerEvents: 'none', color: '#aaa' }

  let validated = {}

  const ProductForm = props => {
    validated = validate('product')

    return (
      <>
        <form onSubmit={props.onSubmit}>
          <h3>What do you need</h3>
          <input
            name="currency"
            type="text"
            placeholder="Currency"
            value={props.values.currency}
            onBlur={props.onBlur}
            onChange={props.onChange}
            style={errorIn('currency') ? errorStyle : {}}
          />
          <input
            name="amount"
            type="text"
            placeholder="Amount"
            value={props.values.amount}
            onBlur={props.onBlur}
            onChange={props.onChange}
            style={errorIn('amount') ? errorStyle : {}}
          />
          <Link
            to="/select/service"
            style={!validated.form ? disabledLink : {}}
          >
            Next
          </Link>
        </form>
        <Debug objects={[state, validated]} />
      </>
    )
  }

  const ServiceForm = props => {
    validated = validate('service')

    return (
      <>
        <form onSubmit={props.onSubmit}>
          <h3>How do you want it delivered</h3>
          <input
            name="delivery"
            type="text"
            placeholder="Delivery"
            value={props.values.delivery}
            onBlur={props.onBlur}
            onChange={props.onChange}
            style={errorIn('delivery') ? errorStyle : {}}
          />

          <button disabled={!validated.form}>Search</button>
        </form>
        <Debug objects={[state, validated]} />
      </>
    )
  }

  const { values } = state

  // Further redirection prevents main router from being aware of step names

  return (
    <Switch>
      <Redirect exact from="/select" to="/select/product" />
      <Route
        path="/select/product"
        render={props => (
          <ProductForm
            {...props}
            values={values}
            onBlur={handleBlur}
            onChange={handleChange}
            onSubmit={doNothing}
          />
        )}
      />
      <Route
        path="/select/service"
        render={props => (
          <ServiceForm
            {...props}
            values={values}
            onBlur={handleBlur}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        )}
      />
    </Switch>
  )
}
