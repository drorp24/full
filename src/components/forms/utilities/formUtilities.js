import React from 'react'

import merge from 'lodash.merge'
import capitalize from '../../utility/capitalize'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'

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
      return capitalize(error.message)
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
export const Form = ({ state, setState, schema, structure, step }) => (
  <FormContext.Provider value={{ state, setState, schema, structure, step }}>
    <form autoComplete="off">
      {structure.length === 1 && <p>{structure[step].label}</p>}
      {structure[step].fields.map(({ name }) => (
        <Field name={name} key={name} />
      ))}
    </form>
  </FormContext.Provider>
)

// Field doesn't need to be exposed: Form iterates over Field using structure and schema props
// However I used context rather than props to enable Field to be exported out easily if needed (and to play with it, of course)
const Field = ({ name, noError = false }) => (
  <FormContext.Consumer>
    {({ state, setState, schema, structure, step }) => {
      // This component updates a state that belongs to its ancestor component
      const handleBlur = e => {
        withState({ state, setState, schema })(handleBlurGeneric)(e)
      }

      const handleChange = async e => {
        withState({ state, setState, schema })(handleChangeGeneric)(e)
      }

      const field = structure[step].fields.filter(
        field => field.name === name
      )[0]

      const { type, required, options, helper } = field

      const { values, touched, errors } = state

      return (
        <div>
          <TextField
            name={name}
            type={type}
            label={capitalize(name)}
            value={values[name]}
            onBlur={handleBlur}
            onChange={handleChange}
            required={required}
            select={!!options}
            error={!!errors[name]}
            helperText={
              !noError && touched[name] && !!errors[name]
                ? errors[name]
                : helper
            }
            SelectProps={{
              MenuProps: {},
            }}
            fullWidth
          >
            {options &&
              options.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
          </TextField>
        </div>
      )
    }}
  </FormContext.Consumer>
)
