import React, { Suspense, useState } from 'react'
import PropTypes from 'prop-types'
import merge from 'lodash.merge'

import { makeStyles } from '@material-ui/styles'
import { FormHelperText } from '@material-ui/core'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import FormLabel from '@material-ui/core/FormLabel'
import FormControl from '@material-ui/core/FormControl'
import Switch from '@material-ui/core/Switch'
import Grid from '@material-ui/core/Grid'

import { object } from 'yup'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import NumberFormat from 'react-number-format'
import { TimePicker, MuiPickersUtilsProvider } from 'material-ui-pickers'
import DateFnsUtils from '@date-io/date-fns'

import { Box, MyTypography } from '../../themed/Box'
import Page from '../../themed/Page'
import capitalize from '../../utility/capitalize'
import ErrorBoundary from '../../error/boundary'
import Loader from '../../utility/Loader'

export const useFormState = structure => {
  // UseFormState's state values populate input 'value' attributes as soon as the form is rendered
  // Only then the useEffect gets called, populating the form values again
  // if state will not have initial values, react will warn about 'changing from uncontrolled to controlled'
  const values = {}
  getFields(structure).forEach(({ name }) => {
    values[name] = ''
  })

  return useState({ values, touched: {}, errors: {} })
}

export const populateFormState = (structure, setState, setSchema) => {
  const state = { values: {}, touched: {}, errors: {} }
  const shape = {}

  getFields(structure).forEach(({ name, value = '', schema }) => {
    state.values[name] = value
    state.touched[name] = false
    try {
      schema.validateSync(value)
      state.errors[name] = false
    } catch (error) {
      state.errors[name] = capitalize(error.message)
    }
    shape[name] = schema
  })

  setState(state)
  setSchema(object(shape))
}

const FormContext = React.createContext()

// TODO: Form is called for every keystroke (regardless of field)
// Field stopped doing that as soon as it was memoized, but that didn't help Form
export const Form = ({ state, setState, schema, structure, step, footer }) => (
  <ErrorBoundary>
    <FormContext.Provider value={{ state, setState, schema, structure, step }}>
      <form autoComplete="off">
        <Page>
          <Box formVariant="header">
            <MyTypography formVariant="header.title.typography" gutterBottom>
              {structure[step].title}
            </MyTypography>
            <MyTypography formVariant="header.subtitle.typography">
              {structure[step].subtitle}
            </MyTypography>
          </Box>
          <Box formVariant="body" formColor="body.color">
            {structure[step].fields.map(({ name }) => (
              <MemoField name={name} key={name} />
            ))}
          </Box>
          <Box formVariant="footer">{footer && footer(step)}</Box>
        </Page>
      </form>
    </FormContext.Provider>
  </ErrorBoundary>
)

Form.propTypes = {
  state: PropTypes.object,
  setState: PropTypes.func,
  schema: PropTypes.object,
  structure: PropTypes.array,
  step: PropTypes.number,
  footer: PropTypes.func,
}

// This component is not exposed; Form has everything it needs to know in structure and schema props
// Field is a container; it doesn't care for the display. <DisplayField /> does.
// The latter has 5 display components, 2 of MUI's and 3 external libraries. Adding a new type requires:
// - defining a new 'type', a dislpay component (<xField />) and an entry for it in DisplayField
// - mapping its onChange signature to generic onChange in onChangeFor
// - if custom validation check is required for that type then checkByType should be updated too
const Field = ({ name, noError = false }) => (
  <FormContext.Consumer>
    {({ state, setState, schema, structure, step }) => {
      const field = structure[step].fields.filter(
        field => field.name === name
      )[0]

      const { type, required, options, helper, icon } = field

      const { values, touched, errors } = state

      const showError = !noError && touched[name] && !!errors[name]

      const onChange = onChangeFor({
        name,
        type,
        state,
        setState,
        schema,
      })

      return (
        <DisplayField
          name={name}
          type={type}
          icon={icon}
          label={capitalize(name)}
          value={values[name]}
          onChange={onChange}
          required={required}
          select={!!options}
          error={showError}
          helperText={showError ? errors[name] : helper}
          fullWidth
          state={state}
        >
          {options &&
            options.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
        </DisplayField>
      )
    }}
  </FormContext.Consumer>
)

// Unless memoized, Field gets rendered 3 unnecessary times for each keystroke
const MemoField = React.memo(Field)

// Up until this point, everything is generic and shouldn't change much
// Customization starts here

const DisplayField = ({ type, ...rest }) => {
  const display = {
    phone: PhoneField,
    switch: SwitchField,
    number: NumberField,
    time: TimeField,
    default: DefaultField,
  }

  const Display = display[type]
  return <Display {...rest} />
}

// Using the classNames approach, as prop adaptation doesn't work here
const PhoneField = ({
  error,
  fullWidth,
  required,
  label,
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

const NumberField = ({ icon, state, value, onChange, ...rest }) => {
  const classes = useFormStyles()

  return (
    <TextField
      InputProps={{
        startAdornment: IconAdornment({ icon, state }),
        className: classes.input,
        inputComponent: MyNumberFormat,
        inputProps: {
          value,
          thousandSeparator: true,
          onValueChange: onChange,
        },
        // NumberFormat triggers the onChange, so this one is redundant
        onChange: () => {},
      }}
      {...rest}
    />
  )
}

// MUI <TextField /> insists on passing inputRef to <NumberFormat />
// <NumberFormat /> doesn't recognize it, so it passes it onwards to native <input>, which complains about not recognizing it either
const MyNumberFormat = ({ inputRef, ...rest }) => <NumberFormat {...rest} />

const TimeField = ({ value, onChange, icon, state, label, helperText }) => {
  const classes = useFormStyles()

  return (
    <FormControl>
      <FormLabel style={{ fontSize: '0.75rem' }}>{label}</FormLabel>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <TimePicker
          value={value}
          onChange={onChange}
          TextFieldComponent={DefaultField}
          // not recognized by TimePicker , InputProps are passed onwards to DefaultField, which uses them to add the icon
          InputProps={{
            startAdornment: IconAdornment({ icon, state }),
            className: classes.input,
          }}
        />
      </MuiPickersUtilsProvider>
      <FormHelperText component="p">{helperText}</FormHelperText>
    </FormControl>
  )
}
const DefaultField = ({ icon, children, state, ...rest }) => {
  const classes = useFormStyles()

  return (
    <TextField
      InputProps={{
        startAdornment: IconAdornment({ icon, state }),
        className: classes.input,
      }}
      {...rest}
    >
      {children}
    </TextField>
  )
}

const IconAdornment = ({ icon, state }) => {
  // 'eager' comment forces webpack to include such imports in main chunk
  // rather than having to fetch each during runtime
  // There's no other way either, as omitting this comment will make webpack crash compiling.
  // In this case import() is used to enable using dynamic file names, not for code split (which is not happenning).
  // Remarkably, it doesnt affect the bundle sizes nor the elapsed load time but both are bloated anyway.

  const iconFile = typeof icon === 'function' ? icon(state) : icon
  const Icon =
    iconFile &&
    React.lazy(() =>
      import(/* webpackMode: "eager" */ `mdi-material-ui/${iconFile}`)
    )

  return (
    <InputAdornment position="start">
      <Suspense fallback={<Loader />}>{iconFile && <Icon />}</Suspense>
    </InputAdornment>
  )
}

const handleEveryChange = ({ name, type, value, state, setState, schema }) => {
  const error = checkByType({ name, type, value, schema })

  const changeToMerge = {
    values: { [name]: value },
    touched: { [name]: true },
    errors: { [name]: error },
  }

  setState(merge(state, changeToMerge))
}

export const checkByType = ({ name, type, value, schema }) => {
  switch (type) {
    case 'phone':
      return phoneCheck({ name, value })
    case 'switch':
      return false
    default:
      return yupCheck({ name, value, schema })
  }
}

const phoneCheck = ({ name, value }) =>
  isValidPhoneNumber(String(value))
    ? false
    : `Please enter a valid ${name} number`

// Yup's async check created problems, and wans't required anyway
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

// return an onChange function that matches the onChange signature the component uses
const onChangeFor = ({ name, type, state, setState, schema }) => {
  switch (type) {
    case 'phone':
      return value =>
        handleEveryChange({
          name,
          type,
          value,
          state,
          setState,
        })
    case 'switch':
      return (event, checked) =>
        handleEveryChange({
          name: event.target.name,
          type,
          value: checked,
          state,
          setState,
        })
    case 'number':
      return ({ value }) =>
        handleEveryChange({
          name,
          type,
          value,
          state,
          setState,
          schema,
        })
    case 'time':
      return date => {
        handleEveryChange({
          name,
          type,
          value: date,
          state,
          setState,
          schema,
        })
      }
    default:
      return ({ target: { name, value } }) =>
        handleEveryChange({
          name,
          type,
          value,
          state,
          setState,
          schema,
        })
  }
}

// Using MUI classic styling method rather than the newer, prop way
// as these styles are passed to a deep component in some xClassName customization param
const useFormStyles = makeStyles(theme => ({
  input: {
    color: theme.palette.primary.main,
  },
}))

const usePhoneStyles = makeStyles(theme => ({
  root: {
    background: 'inherit',
    borderBottom: '1px solid rgba(0, 0, 0, 0.42) !important',
    color: theme.palette.primary.main,
  },
  error: {
    borderBottomColor: `${theme.palette.error.main} !important`,
  },
}))

export const multiStepFormValidGeneric = (steps, step, state) => {
  const result =
    Object.entries(state.errors).filter(
      entry => entry[1] && steps[step].fields.some(i => i.name === entry[0])
    ).length === 0

  return result
}

// Not required if user is forced to populate all fields to have the next/submit button enabled
// Demonstrates the power of destructuring
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
    handleEveryChange({ name, type, value, state, setState, schema })
  })
}

// merge fields across steps
const getFields = structure =>
  structure.reduce(
    (acc, curr) =>
      curr.hasOwnProperty('fields') ? [...acc, ...curr.fields] : acc,
    []
  )
