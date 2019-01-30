import React from 'react'
import PropTypes from 'prop-types'
import merge from 'lodash.merge'

import { makeStyles } from '@material-ui/styles'
import { FormHelperText } from '@material-ui/core'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import FormLabel from '@material-ui/core/FormLabel'
import FormControl from '@material-ui/core/FormControl'
import Switch from '@material-ui/core/Switch'
import Grid from '@material-ui/core/Grid'

import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

import { Box, MyTypography } from '../../themed/Box'
import Page from '../../themed/Page'
import capitalize from '../../utility/capitalize'

const yupCheck = ({ name, value, schema }) => {
  try {
    schema.validateSyncAt(name, {
      [name]: value,
    })
    return false
  } catch (error) {
    return capitalize(error.message)
  }
}

const phoneCheck = ({ name, value }) =>
  isValidPhoneNumber(String(value))
    ? false
    : `Please enter a valid ${name} number`

const checkByType = ({ name, type, value, schema }) => {
  switch (type) {
    case 'phone':
      return phoneCheck({ name, value })
    case 'switch':
      return false
    default:
      return yupCheck({ name, value, schema })
  }
}

const handleGenericChange = ({
  name,
  type,
  value,
  state,
  setState,
  schema,
}) => {
  const error = checkByType({ name, type, value, schema })

  const changeToMerge = {
    values: { [name]: value },
    touched: { [name]: true },
    errors: { [name]: error },
  }

  setState(merge(state, changeToMerge))
}

// return an onChange function that matches the onChange signature the component uses
const onChangeFor = ({ type, state, setState, schema }) => {
  switch (type) {
    case 'phone':
      return value =>
        handleGenericChange({
          name: 'phone',
          type,
          value,
          state,
          setState,
        })
    case 'switch':
      return (event, checked) =>
        handleGenericChange({
          name: event.target.name,
          type,
          value: checked,
          state,
          setState,
        })
    default:
      return event =>
        handleGenericChange({
          name: event.target.name,
          type,
          value: event.target.value,
          state,
          setState,
          schema,
        })
  }
}

export const multiStepFormValidGeneric = (steps, step, state) => {
  const result =
    Object.entries(state.errors).filter(
      entry => entry[1] && steps[step].fields.some(i => i.name === entry[0])
    ).length === 0

  return result
}

// activated only if next button isn't disabled, which can happen only if initial error values aren't true
export const visitUntouched = ({
  state,
  setState,
  structure,
  step,
  schema,
}) => {
  structure[step].fields.forEach(field => {
    const { name, type } = field
    const {
      touched: { [name]: isTouched },
      values: { [name]: value },
    } = state
    if (isTouched) return
    handleGenericChange({ name, type, value, state, setState, schema })
  })
}

const usePhoneStyles = makeStyles(theme => ({
  root: {
    background: 'inherit',
    borderBottom: '1px solid rgba(0, 0, 0, 0.42) !important',
  },
  error: {
    borderBottomColor: `${theme.palette.error.main} !important`,
  },
}))

const FormContext = React.createContext()

// Oddly, Form is called for each keystroke regardless of field
// Field stopped doing that as soon as it was memoized, but that didn't help Form
export const Form = ({ state, setState, schema, structure, step, footer }) => (
  <FormContext.Provider value={{ state, setState, schema, structure, step }}>
    <form autoComplete="off">
      <Page>
        <Box formVariant="header">
          <MyTypography formVariant="header.title.typography" gutterBottom>
            {structure[step].title}
          </MyTypography>
          <MyTypography
            formVariant="header.subtitle.typography"
            formColor="header.subtitle.color"
          >
            {structure[step].subtitle}
          </MyTypography>
        </Box>
        <Box formVariant="body">
          {structure[step].fields.map(({ name }) => (
            <MemoField name={name} key={name} />
          ))}
        </Box>
        <Box formVariant="footer">{footer && footer(step)}</Box>
      </Page>
    </form>
  </FormContext.Provider>
)

Form.propTypes = {
  state: PropTypes.object,
  setState: PropTypes.func,
  schema: PropTypes.object,
  structure: PropTypes.array,
  step: PropTypes.number,
  footer: PropTypes.func,
}

// Field doesn't need to be exposed: Form has everything it needs from structure and schema props
const Field = ({ name, noError = false }) => (
  <FormContext.Consumer>
    {({ state, setState, schema, structure, step }) => {
      const field = structure[step].fields.filter(
        field => field.name === name
      )[0]

      const { type, required, options, helper } = field

      const { values, touched, errors } = state

      const showError = !noError && touched[name] && !!errors[name]

      const onChange = onChangeFor({
        type,
        state,
        setState,
        schema,
      })

      return (
        <FieldType
          type={type}
          name={name}
          label={capitalize(name)}
          value={values[name]}
          onChange={onChange}
          required={required}
          select={!!options}
          error={showError}
          helperText={showError ? errors[name] : helper}
          fullWidth
        >
          {options &&
            options.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
        </FieldType>
      )
    }}
  </FormContext.Consumer>
)

// Unless memoized, Field gets rendered 3 (!) unnecessary times for each keystroke!
const MemoField = React.memo(Field)

const FieldType = ({ type, children, ...rest }) => {
  switch (type) {
    case 'phone':
      return <PhoneField {...rest} />
    case 'switch':
      return <SwitchField {...rest} />
    default:
      return <TextField {...rest}>{children}</TextField>
  }
}

// Using the classNames approach, as prop adaptation doesn't work here
const PhoneField = ({
  error,
  fullWidth,
  required,
  label,
  placeholder,
  value,
  onChange,
  helperText,
}) => {
  const classes = usePhoneStyles()
  return (
    <FormControl error={error} fullWidth={fullWidth}>
      <FormLabel required={required} style={{ fontSize: '0.75rem' }}>
        {label}
      </FormLabel>
      <PhoneInput
        country="IL"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        inputClassName={
          error
            ? classes.root + ' ' + classes.error // classNames-style working solution
            : classes.root
        }
      />
      <FormHelperText component="p">{helperText}</FormHelperText>
    </FormControl>
  )
}

const SwitchField = ({ name, value, helperText, onChange }) => (
  <Grid container direction="row" justify="space-between" alignItems="center">
    <MyTypography formColor={value ? '' : 'body.fields.disabled'}>
      {helperText}
    </MyTypography>
    <Switch color="primary" name={name} checked={value} onChange={onChange} />
  </Grid>
)
