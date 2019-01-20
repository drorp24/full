import React from 'react'

import merge from 'lodash.merge'
import capitalize from '../../utility/capitalize'

// Unlike classes' setState, hooks' setState does not automatically merge update objects (why?)
// I could do (and did) that with spread operator, as long as I used the setState's function form,
// but spread operator will handle one level only, whereas lodash.merge will handle all levels recursively
// so lodash.merge should be the go-to solution for setState when it comes to hooks
export const handleBlurGeneric = ({ props: e, state, setState }) => {
  const { name } = e.target

  setState(merge(state, { touched: { [name]: true } }))
}

//Unlike Formik, I set 'touched' as soon as a change is made
export const handleChangeGeneric = async ({
  props: e,
  state,
  setState,
  schema,
}) => {
  const { name, value } = e.target

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
  const error = await check(name, value)

  const changeToMerge = {
    values: { [name]: value },
    touched: { [name]: true },
    errors: { [name]: error },
  }

  setState(merge(state, changeToMerge))
}

export const withState = ({ state, setState, schema }) => func => async props =>
  func({ props, state, setState, schema })

export const multiStepFormValidGeneric = (steps, step, state) =>
  Object.entries(state.errors).filter(
    entry => entry[1] && steps[step].fields.some(i => i.name === entry[0])
  ).length === 0

const FormContext = React.createContext()

// Form will work just as fine with a single step form
export const Form = ({
  state: { values, errors, touched },
  onBlur,
  onChange,
  structure,
  step,
}) => (
  <FormContext.Provider value={{ values, touched, errors, onBlur, onChange }}>
    <form autoComplete="off">
      {structure[step].fields.map(({ name, type }) => (
        <Field name={name} type={type} key={name} />
      ))}
    </form>
  </FormContext.Provider>
)

// Field doesn't need to be exposed, as Form gets a 'steps' props and that's it
const Field = ({ name, type, noError = false }) => (
  <FormContext.Consumer>
    {formContext => (
      <>
        <div>
          <input
            name={name}
            type={type}
            placeholder={capitalize(name)}
            value={formContext.values[name]}
            onBlur={formContext.onBlur}
            onChange={formContext.onChange}
          />
        </div>
        {!noError && (
          <div>
            &nbsp;
            <span>{formContext.touched[name] && formContext.errors[name]}</span>
          </div>
        )}
      </>
    )}
  </FormContext.Consumer>
)
