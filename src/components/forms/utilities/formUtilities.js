import React, { Suspense, useState } from 'react'
import PropTypes from 'prop-types'
import { produce } from 'immer'

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
import MuiAutosuggest from '../utilities/MuiAutosuggest'

import { Box, MyTypography } from '../../themed/Box'
import Page from '../../themed/Page'
import capitalize from '../../utility/capitalize'
import ErrorBoundary from '../../error/boundary'
import Loader from '../../utility/Loader'

export const useFormState = structure => {
  const state = { values: {}, touched: {}, errors: {} }
  const { values, touched, errors } = state

  getFields(structure).forEach(({ name, value = '', fieldSchema }) => {
    values[name] = value
    touched[name] = false
    try {
      fieldSchema && fieldSchema.validateSync(value)
      errors[name] = false
    } catch (error) {
      errors[name] = capitalize(error.message)
    }
  })

  return useState(state)
}

export const createSchema = async (structure, setSchema) => {
  const shape = {}

  getFields(structure).forEach(async ({ name, fieldSchema, fetchList }) => {
    shape[name] = fieldSchema
    if (fetchList) {
      // I assume fetchList is always a function
      const list = await fetchList()
      const permittedValues = list.map(item => item.display)
      shape[name] = fieldSchema.oneOf(
        permittedValues,
        "We don't know this coin, sorry!"
      )
    }
    setSchema(object(shape))
  })
}

const FormContext = React.createContext()

// TODO: Form is called for every keystroke (regardless of field)
// EveryField stopped doing that as soon as it was memoized, but that didn't help Form
export const Form = ({
  state,
  setState,
  schema,
  structure,
  step,
  show,
  footer,
}) => (
  <ErrorBoundary>
    <FormContext.Provider
      value={{ state, setState, schema, structure, step, show }}
    >
      <form autoComplete="off">
        <Page>
          <Box formVariant="header">
            <MyTypography formVariant="header.title.typography" gutterBottom>
              {structure[step].title}
            </MyTypography>
            <MyTypography formVariant="header.subtitle.typography" gutterBottom>
              <span style={{ whiteSpace: 'pre-line' }}>
                {structure[step].subtitle}
              </span>
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
// Logic that pertains to all fields should be here, not in the display components
//
// There are currently 6 display components, 2 of MUI's and 4 external.
// New types should be easy to add and not change the FormContainer interface.
// Adding a new type requires:
// - defining a new 'type', a dislpay component (<xField />) and an entry for it in DisplayField
// - mapping its onChange signature to generic onChange in onChangeFor
// - if custom validation check is required for that type then checkByType should be updated too
const EveryField = ({ name }) => (
  <FormContext.Consumer>
    {({ state, setState, schema, structure, step, show }) => {
      //
      const field = structure[step].fields.filter(
        field => field.name === name
      )[0]

      const {
        type,
        fieldSchema,
        required,
        label,
        helper,
        options,
        icon,
        fetchList,
      } = field

      const {
        values: { [name]: fieldValue },
        touched: { [name]: fieldTouched },
        errors: { [name]: fieldError },
      } = state

      const error = !show.noError && fieldTouched && !!fieldError
      const helperText = error ? fieldError : show.helper ? helper : ' '
      const fieldLabel = !show.label ? '' : label ? label : capitalize(name)

      const fieldOptions =
        typeof options === 'function' ? options(state) : options

      const value =
        typeof fieldValue === 'function' ? fieldValue(state) : fieldValue

      const onChange = onChangeFor({
        name,
        type,
        fieldSchema,
        state,
        setState,
        schema,
      })

      return (
        <DisplayField
          name={name}
          type={type}
          icon={icon}
          label={fieldLabel}
          value={value}
          onChange={onChange}
          required={required}
          select={!!fieldOptions}
          error={error}
          helperText={helperText}
          helper={helper}
          fullWidth
          state={state}
          fetchList={fetchList}
        >
          {fieldOptions &&
            fieldOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
        </DisplayField>
      )
    }}
  </FormContext.Consumer>
)

// Unless memoized, EveryField gets rendered 3 unnecessary times for each keystroke
const MemoField = React.memo(EveryField)

// Up until this point, everything is generic and shouldn't change much
// Customization starts here

const DisplayField = ({ type, ...rest }) => {
  const display = {
    phone: PhoneField,
    switch: SwitchField,
    number: NumberField,
    time: TimeField,
    autosuggest: AutosuggestField,
    default: DefaultField,
  }

  const Display = display[type]
  return <Display {...rest} />
}

DisplayField.propTypes = {
  type: PropTypes.oneOf([
    'phone',
    'switch',
    'number',
    'time',
    'autosuggest',
    'default',
  ]),
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

const SwitchField = ({ name, value, helper, onChange }) => (
  <Grid container direction="row" justify="space-between" alignItems="center">
    <MyTypography formColor={value ? '' : 'body.fields.disabled'}>
      {helper}
    </MyTypography>
    <Switch color="primary" name={name} checked={value} onChange={onChange} />
  </Grid>
)

const NumberField = ({ icon, state, value, onChange, fetchList, ...rest }) => {
  const classes = useFormStyles()

  return (
    <TextField
      InputProps={{
        startAdornment:
          showAdornment(icon, value) && IconAdornment({ icon, state }),
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
      value={value}
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
            startAdornment:
              showAdornment(icon, value) && IconAdornment({ icon, state }),
            className: classes.input,
          }}
        />
      </MuiPickersUtilsProvider>
      <FormHelperText component="p">{helperText}</FormHelperText>
    </FormControl>
  )
}

const AutosuggestField = ({
  icon,
  value,
  state,
  onChange,
  fetchList,
  fullWidth,
  ...rest
}) => {
  const classes = useFormStyles()

  return (
    <TextField
      InputProps={{
        startAdornment:
          showAdornment(icon, value) && IconAdornment({ icon, state }),
        className: classes.input,
        inputComponent: MuiAutosuggest,
        inputProps: {
          value,
          onChange,
          fetchList,
        },
        // see NumberFormat
        onChange: () => {},
      }}
      value={value}
      fullWidth={fullWidth}
      {...rest}
    />
  )
}

const DefaultField = ({ value, icon, children, state, fetchList, ...rest }) => {
  const classes = useFormStyles()

  return (
    <TextField
      InputProps={{
        startAdornment:
          showAdornment(icon, value) && IconAdornment({ icon, state }),
        className: classes.input,
      }}
      value={value}
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

const handleEveryChange = ({
  name,
  type,
  fieldSchema,
  value,
  setState,
  schema,
}) => {
  const error = checkByType({ name, type, fieldSchema, value, schema })

  setState(
    produce(draft => {
      const { values, touched, errors } = draft
      values[name] = value
      touched[name] = true
      errors[name] = error
    })
  )
}

export const checkByType = ({ name, type, fieldSchema, value, schema }) => {
  if (type === 'phone') return phoneCheck({ name, value })
  if (fieldSchema) return yupCheck({ name, value, schema })
  return false
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

// return an onChange function whose signature matches the onChange func the type of component uses
// that returns one single function that deals with every change regardless of type
const onChangeFor = ({ name, type, fieldSchema, state, setState, schema }) => {
  const handleChange = ({ name, value }) =>
    handleEveryChange({
      name,
      type,
      fieldSchema,
      value,
      state,
      setState,
      schema,
    })

  switch (type) {
    case 'phone':
      return value => handleChange({ name, value })
    case 'switch':
      return ({ target: { name } }, value) => handleChange({ name, value })
    case 'number':
      return ({ value }) => handleChange({ name, value })
    case 'time':
      return value => handleChange({ name, value })
    case 'autosuggest':
      return value => handleChange({ name, value })
    default:
      return ({ target: { name, value } }) => handleChange({ name, value })
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

// TODO: Separate adornments from fields, else empty fields' labels are lifted
const showAdornment = (icon, value) =>
  icon && typeof icon === 'function' ? !!value : !!icon
