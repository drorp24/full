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
//
// Which is actually a good practice even for non multi-step/wizard forms:
// An upper element that deals with state only and a lower element that deals with presentation only.

import React, { useState } from 'react'
import { Route, Redirect, Switch, Link } from 'react-router-dom'
import { object, string, number, boolean } from 'yup'

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

  const schema = object().shape({
    currency: string()
      .required()
      .min(3)
      .max(3)
      .matches(/(USD|EUR)/),
    amount: number()
      .required()
      .positive(),
    delivery: boolean(),
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

  const inputErrorStyle = { borderWidth: '1', borderColor: 'red' }

  const formValid = () =>
    // Assumption: initial form values are valid. Hence both false and null are ok
    !Object.values(state.errors).some(i => !!i)

  const navButtonErrorStyle = { pointerEvents: 'none', color: '#aaa' }

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

    setState(state => ({
      ...state,
      values: { ...state.values, [name]: value },
      touched: { ...state.touched, [name]: true },
      errors: { ...state.errors, [name]: error },
    }))
  }
  // though handleSubmit is passed to every form in the way, it is only the last one that invokes it
  // this is since the <Link /> intercepts the user's click which is not propagated to the button
  const handleSubmit = e => {
    e.preventDefault()

    console.log('Submitting values. state: ', state)
  }

  const formStyle = { margin: '5%', padding: '5%' }
  const inputStyle = {
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

  // Dynamic component rendering 💪 . For that to work:
  // - pass a render prop whose value is the defined react component (its reference, not its name string)
  // - assign the prop's key (here: form) to a PascalCase variable name (here: FormName) and use the latter
  // (remember the diff b/w deep destructuring [inner {}] and renaming [no {}] )
  const Form = ({ render: { form: FormName } }) => (
    <FormName
      state={state}
      onBlur={handleBlur}
      onChange={handleChange}
      onSubmit={handleSubmit}
      formValid={formValid}
      formStyle={formStyle}
      inputStyle={inputStyle}
      inputErrorStyle={inputErrorStyle}
      navButtonStyle={navButtonStyle}
      navButtonErrorStyle={navButtonErrorStyle}
    />
  )

  return (
    <Switch>
      {/* This redirect saves main component from having to be aware of inner form names */}
      <Redirect exact from="/select" to="/select/product" />
      <Route
        path="/select/product"
        render={props => (
          <ProductForm
            {...props}
            state={state}
            onBlur={handleBlur}
            onChange={handleChange}
            onSubmit={handleSubmit}
            formValid={formValid}
            formStyle={formStyle}
            inputStyle={inputStyle}
            inputErrorStyle={inputErrorStyle}
            navButtonStyle={navButtonStyle}
            navButtonErrorStyle={navButtonErrorStyle}
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
            formValid={formValid}
            formStyle={formStyle}
            inputStyle={inputStyle}
            inputErrorStyle={inputErrorStyle}
            navButtonStyle={navButtonStyle}
          />
        )}
      />
    </Switch>
  )
}

const ProductForm = ({
  state: { values, errors, touched },
  onBlur,
  onChange,
  onSubmit,
  formValid,
  formStyle,
  inputStyle,
  inputErrorStyle,
  navButtonStyle,
  navButtonErrorStyle,
}) => (
  <form onSubmit={onSubmit} style={formStyle} autoComplete="off">
    <h3>What do you need</h3>
    <p>
      <input
        name="currency"
        type="text"
        placeholder="Currency"
        value={values.currency}
        onBlur={onBlur}
        onChange={onChange}
        style={
          touched.currency && errors.currency
            ? { ...inputStyle, ...inputErrorStyle }
            : inputStyle
        }
      />
    </p>
    <p>
      &nbsp;<span>{touched.currency && errors.currency}</span>
    </p>
    <p>
      <input
        name="amount"
        type="text"
        placeholder="Amount"
        value={values.amount}
        onBlur={onBlur}
        onChange={onChange}
        style={
          touched.amount && errors.amount
            ? { ...inputStyle, ...inputErrorStyle }
            : inputStyle
        }
      />
    </p>
    <p>
      &nbsp;<span>{touched.amount && errors.amount}</span>
    </p>
    <Link to="/select/service">
      <button type="button" disabled={!formValid()} style={navButtonStyle}>
        Next
      </button>
    </Link>
  </form>
)

const ServiceForm = ({
  state: { values, errors, touched },
  onBlur,
  onChange,
  onSubmit,
  formValid,
  formStyle,
  inputStyle,
  inputErrorStyle,
  navButtonStyle,
}) => (
  <form onSubmit={onSubmit} style={formStyle} autoComplete="off">
    <h3>How do you want it delivered</h3>
    <p>
      <input
        name="delivery"
        type="text"
        placeholder="Delivery"
        value={values.delivery}
        onBlur={onBlur}
        onChange={onChange}
        style={
          touched.delivery && errors.delivery
            ? { ...inputStyle, ...inputErrorStyle }
            : inputStyle
        }
      />
    </p>
    <p>
      &nbsp;<span>{touched.delivery && errors.delivery}</span>
    </p>

    <Link to="#">
      <button style={navButtonStyle} disabled={!formValid()}>
        Search
      </button>
    </Link>
  </form>
)
