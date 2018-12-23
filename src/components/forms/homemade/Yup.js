// Multi-step hooks form
// with validations
// with routing
// with yup
//
// In previous commit, productForm and serviceForm were defined within SearchForm
// That caused focus to disappear with each keystroke
// Reason: the changed state triggered re-rendering; but the forms were re-rendered as well
// Now that these forms are *not* re-rendered, their focus remains intact.
// Separating them made me pass them state and associated functions / styles props

import React, { useState } from 'react'
import { Route, Redirect, Switch, Link } from 'react-router-dom'
import * as yup from 'yup'

export default function SearchForm() {
  // though errors can be derived from state, i ended up including them in it
  // that's the easiest way to trigger re-rendering when an error occurs
  const [state, setState] = useState({
    values: {
      currency: 'USD',
      amount: 1000,
      delivery: false,
    },
    touched: {
      currency: false,
      amount: false,
      delivery: false,
    },
    errors: {
      currency: null,
      amount: null,
      delivery: null,
    },
  })

  const schema = yup.object().shape({
    currency: yup
      .string()
      .required()
      .min(3)
      .max(3)
      .matches(/(USD|EUR)/),
    amount: yup
      .number()
      .required()
      .positive(),
    delivery: yup.boolean(),
  })

  const check = async (field, value) => {
    try {
      await schema.validateAt(field, {
        [field]: value,
      })
      return false
    } catch (error) {
      return error.message
    }
  }

  const errorIn = field => state.touched[field] && !!state.errors[field]
  // once i use Styled Components i won't have to pass styles around
  const errorStyle = { borderWidth: '1', borderColor: 'red' }

  const formValid = () =>
    // Assumption: initial form values are valid. Hence both false and null are ok
    !Object.values(state.errors).some(i => !!i)
  const disabledLink = { pointerEvents: 'none', color: '#aaa' }

  // Unlike classes' setState, useState does not automatically merge update objects.
  // One can do that with spread syntax, provided setState's function form is used.
  const handleBlur = e => {
    const { name } = e.target

    setState(state => {
      return { ...state, touched: { ...state.touched, [name]: true } }
    })
  }

  const handleChange = async e => {
    const { name, value } = e.target
    const error = await check(name, value)

    setState(state => {
      return {
        ...state,
        values: { ...state.values, [name]: value },
        touched: { ...state.touched, [name]: true },
        errors: { ...state.errors, [name]: error },
      }
    })
  }

  const handleSubmit = e => {
    e.preventDefault()

    console.log('Submitting values. state: ', state)
  }

  const doNothing = e => {
    e.preventDefault()
    console.log('Step form submitted - doing nothing')
  }

  const formStyle = { margin: '5%', padding: '5%' }
  const formInput = {
    width: '90%',
    padding: '5%',
    borderColor: '#aaa',
    fontSize: '2.5em',
  }
  const navButtonStyle = {
    width: '100%',
    position: 'absolute',
    left: '0',
    bottom: '15%',
    fontSize: '2.5em',
  }

  // Further redirection prevents main router from being aware of step names

  return (
    <Switch>
      <Redirect exact from="/select" to="/select/product" />
      <Route
        path="/select/product"
        render={props => (
          <ProductForm
            {...props}
            state={state}
            onBlur={handleBlur}
            onChange={handleChange}
            onSubmit={doNothing}
            errorIn={errorIn}
            errorStyle={errorStyle}
            formValid={formValid}
            formStyle={formStyle}
            formInput={formInput}
            navButtonStyle={navButtonStyle}
            disabledLink={disabledLink}
          />
        )}
      />
      <Route
        path="/select/service"
        render={props => (
          <ServiceForm
            {...props}
            state={state}
            onBlur={handleBlur}
            onChange={handleChange}
            onSubmit={handleSubmit}
            errorIn={errorIn}
            errorStyle={errorStyle}
            formValid={formValid}
            formStyle={formStyle}
            formInput={formInput}
            navButtonStyle={navButtonStyle}
          />
        )}
      />
    </Switch>
  )
}

const ProductForm = props => {
  const {
    state,
    onBlur,
    onChange,
    onSubmit,
    errorIn,
    errorStyle,
    formValid,
    formStyle,
    formInput,
    navButtonStyle,
    disabledLink,
  } = props
  const errorInCurrency = errorIn('currency')
  const errorInAmount = errorIn('amount')
  return (
    <form onSubmit={onSubmit} style={formStyle} autoComplete="off">
      <h3>What do you need</h3>
      <p>
        <input
          name="currency"
          type="text"
          placeholder="Currency"
          value={state.values.currency}
          onBlur={onBlur}
          onChange={onChange}
          style={errorInCurrency ? { ...formInput, ...errorStyle } : formInput}
        />
      </p>
      <p>&nbsp;{errorInCurrency && <span>{state.errors.currency}</span>}</p>
      <p>
        <input
          name="amount"
          type="text"
          placeholder="Amount"
          value={state.values.amount}
          onBlur={onBlur}
          onChange={onChange}
          style={errorInAmount ? { ...formInput, ...errorStyle } : formInput}
        />
      </p>
      <p>{errorInAmount && <span>{state.errors.amount}</span>}</p>
      <button style={navButtonStyle}>
        <Link to="/select/service" style={!formValid() ? disabledLink : {}}>
          Next
        </Link>
      </button>
    </form>
  )
}

const ServiceForm = props => {
  const {
    state,
    onBlur,
    onChange,
    onSubmit,
    errorIn,
    errorStyle,
    formValid,
    formStyle,
    formInput,
    navButtonStyle,
  } = props
  const errorInDelivery = errorIn('delivery')

  return (
    <form onSubmit={onSubmit} style={formStyle} autoComplete="off">
      <h3>How do you want it delivered</h3>
      <p>
        <input
          name="delivery"
          type="text"
          placeholder="Delivery"
          value={state.values.delivery}
          onBlur={onBlur}
          onChange={onChange}
          style={errorInDelivery ? { ...formInput, ...errorStyle } : formInput}
        />
      </p>
      <p>{errorInDelivery && <span>{state.errors.delivery}</span>}</p>

      <button disabled={!formValid()} style={navButtonStyle}>
        Search
      </button>
    </form>
  )
}
