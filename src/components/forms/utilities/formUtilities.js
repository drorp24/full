import React, { Suspense, useState, useContext } from 'react'
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
import { getList, setList } from './lists'
import { mark } from '../../utility/performance'

//
// A. Utility functions to create/modify state, lists and schema
//
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

export const setLists = (structure, setState) => {
  console.log('setLists called')
  getFields(structure)
    .filter(field => !!field.list)
    .forEach(({ list }) => {
      setList({ list, setState })
    })
}

export const createSchema = (structure, state, setSchema) => {
  const shape = {}

  getFields(structure).forEach(({ name, fieldSchema, list }) => {
    shape[name] = fieldSchema
    const fetchedList = getList({ list, state })
    if (fetchedList) {
      const permittedValues = fetchedList.map(item => item.name)
      shape[name] = fieldSchema.oneOf(
        permittedValues,
        'Start typing and select from the list'
      )
    }
    setSchema(object(shape))
  })
}

//
// B. Form and sons: components & styling
//
const FormContext = React.createContext()

// TODO: Form is called for every keystroke (regardless of field)
// most probably because it gets state as a prop rather than creating its own
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

// No Field component is ever exposed; Form gets everything it needs thru props like structure, schema and state
// Logic that pertains to all fields should be here, not in the display components
//
// There are currently 6 display components, 2 of MUI's and 4 external.
// New types should be easy to add and not change the FormContainer interface.
// Adding a new type requires:
// - defining a new 'type', a dislpay component (<xField />) and an entry for it in DisplayField
// - mapping its onChange signature to generic onChange in onChangeFor
// - if custom validation check is required for that type then checkByType should be updated too
// Unless memoized, EveryField gets rendered 3 unnecessary times for each keystroke

const EveryField = ({ name }) => (
  // TODO: props passing
  // 1. state and setState should be consumed by the interested components rather than getting passed by as props
  // 2. Group unique field properties (e.g., list, update) i.e., any field that doesn't interest *all* types
  //    into one uniqProps obj prop so it can be "gotten ridden of" (not passed onwards) as one property by the ubinterested components.
  //    Currently, any such uninteresting prop should be *updated* in any type that passes all props downwards
  //    so it can get rid of that and not pass it onwards (otherwise it leaks to the DOM, yielding an error).
  // 3. Group the interest-all (e.g., name) props into one single obj too. That will enable using the JSX shorthand {...}
  //    which like JS saves the need to write things like name={name}.

  // I left this but next I'll use useContext hook as it's simpler
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
        list,
        update,
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

      const uniqProps = { update }

      const Options = () =>
        fieldOptions.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))

      const displayFieldProps = {
        name,
        type,
        icon,
        label: fieldLabel,
        value,
        onChange,
        required,
        select: !!fieldOptions,
        error,
        helperText,
        helper,
        state,
        list,
        uniqProps,
      }

      return (
        <DisplayField {...displayFieldProps} fullWidth>
          {fieldOptions && Options}
        </DisplayField>
      )
    }}
  </FormContext.Consumer>
)

const MemoField = React.memo(EveryField)

// Up until this point, everything is generic and shouldn't change much
// Customization starts here

// This is the way to include a dynamic Component whose name is derived from a prop (in this case, 'type')
// There's no 'Display' Component per ce, it's just a cover for a host of other components
// Dynamic component is for cases where different components all require the same props but each does differet things with these same props
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

// An example for using the classNames approach for customization (rather than props for instance)
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

const NumberField = ({ icon, state, value, onChange, uniqProps, ...rest }) => {
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
  name,
  icon,
  value,
  onChange,
  fullWidth,
  list,
  uniqProps: { update },
  ...rest
}) => {
  const classes = useFormStyles()
  const context = useContext(FormContext)
  const { state, setState } = context
  const entireList = getList({ list, state })

  const onBlur = (event, { highlightedSuggestion }) => {
    if (!update) return
    mark(name + ' blurred')
    console.log(
      'onBlur activated.  highlightedSuggestion:',
      highlightedSuggestion
    )
    setList({ list: update, state, setState })
  }

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
          onBlur,
          entireList,
          quantity: 9,
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

const DefaultField = ({ value, icon, children, state, uniqProps, ...rest }) => {
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

// External libraries that enable customizing their inner components do it with props like 'InputProps'
// Hence for customization, MUI's classic styling below will yield the 'className'/'classes' to be passed to such props.
// When all components are mine, on the other hand, it is better to use the newer prop-based method
// as it enables the components' props to directly refer to theme values w/o the need to write makeStyles.
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

//
// C. OnChange functions and validation
//

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

// Yup's async check created problems, and wasn't required anyway
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

// return an onChange function whose signature matches the one used by the component type
// that returns a single funified unction to deal with any change regardless of type
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

export const multiStepFormValidGeneric = (steps, step, state) => {
  const result =
    Object.entries(state.errors).filter(
      entry => entry[1] && steps[step].fields.some(i => i.name === entry[0])
    ).length === 0

  return result
}

// Not required if user is forced to populate all fields to have the next/submit button enabled
// Destructuring at its best
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
