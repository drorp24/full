// JUST IGNORE IT
// move on to Yup.js
//
// Multi-step hooks form
// With validations
// With routing

import React, { useState } from 'react'
import { Route, Redirect, Switch, Link } from 'react-router-dom'

export default function SearchForm() {
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
    validated[name] = !!value
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

  const { values } = state

  //Further redirection prevents main router from being aware of step names

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
            errorIn={errorIn}
            disabledLink={disabledLink}
            errorStyle={errorStyle}
            validated={validated}
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
            errorIn={errorIn}
            disabledLink={disabledLink}
            errorStyle={errorStyle}
            validated={validated}
          />
        )}
      />
    </Switch>
  )
}

const ProductForm = props => {
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
          style={props.errorIn('currency') ? props.errorStyle : {}}
        />
        <input
          name="amount"
          type="text"
          placeholder="Amount"
          value={props.values.amount}
          onBlur={props.onBlur}
          onChange={props.onChange}
          style={props.errorIn('amount') ? props.errorStyle : {}}
        />
        <Link
          to="/select/service"
          style={!props.validated.form ? props.disabledLink : {}}
        >
          Next
        </Link>
      </form>
    </>
  )
}

const ServiceForm = props => {
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
          style={props.errorIn('delivery') ? props.errorStyle : {}}
        />

        <button disabled={!props.validated.form}>Search</button>
      </form>
    </>
  )
}
