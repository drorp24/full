import React, { Suspense } from 'react'
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

import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import NumberFormat from 'react-number-format'

import { Box, MyTypography } from '../../themed/Box'
import Page from '../../themed/Page'
import capitalize from '../../utility/capitalize'
import ErrorBoundary from '../../error/boundary'
import Loader from '../../utility/Loader'

// import Cash from 'mdi-material-ui/Cash'

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

const handleEveryChange = ({ name, type, value, state, setState, schema }) => {
  const error = checkByType({ name, type, value, schema })

  const changeToMerge = {
    values: { [name]: value },
    touched: { [name]: true },
    errors: { [name]: error },
  }

  setState(merge(state, changeToMerge))
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
    default:
      return event =>
        handleEveryChange({
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
    handleEveryChange({ name, type, value, state, setState, schema })
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

// Field doesn't need to be exposed: Form has everything it needs from structure and schema props
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
        <EveryField
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
        </EveryField>
      )
    }}
  </FormContext.Consumer>
)

// Unless memoized, Field gets rendered 3 (!) unnecessary times for each keystroke!
const MemoField = React.memo(Field)

const EveryField = ({ type, icon, children, state, ...rest }) => {
  switch (type) {
    case 'phone':
      return <PhoneField {...rest} />
    case 'switch':
      return <SwitchField {...rest} />
    default:
      return (
        <MyTextField type={type} icon={icon} state={state} {...rest}>
          {children}
        </MyTextField>
      )
  }
}

// Using MUI classic styling method rather than the newer, prop way
// as the style needs to be injected to a lower component
const useFormStyles = makeStyles(theme => ({
  input: {
    color: theme.palette.primary.main,
  },
}))

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

const MyTextField = ({ type, icon = null, children, state, ...rest }) => {
  // 'eager' comment forces webpack to include such imports in main chunk
  // rather than packaging each into its own separate chunk
  // There's no other way either, as omitting this comment will make webpack crash compiling.
  // In this case import() is used to enable using dynamic file names, not for code split.
  // Remarkably, it didn't affect the bundle sizes not the elapsed load time.

  const { value, onChange } = rest

  const iconFile = typeof icon === 'function' ? icon(state) : icon
  const Icon =
    iconFile &&
    React.lazy(() =>
      import(/* webpackMode: "eager" */ `mdi-material-ui/${iconFile}`)
    )

  const classes = useFormStyles()

  return (
    <TextField
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Suspense fallback={<Loader />}>{iconFile && <Icon />}</Suspense>
          </InputAdornment>
        ),
        className: classes.input,
        // https://medium.com/@mikeh91/conditionally-adding-keys-to-javascript-objects-using-spread-operators-and-short-circuit-evaluation-acf157488ede
        ...(type === 'number' && {
          // The component to place instead of native <input /> when type is 'number'
          inputComponent: MyNumberFormat,
          // Its props
          inputProps: {
            value,
            thousandSeparator: true,
            onValueChange: onChange,
          },
          // with 'number', NumberFormat triggers the onChange, hence this is redundant
          onChange: () => {},
        }),
      }}
      {...rest}
    >
      {children}
    </TextField>
  )
}

// For unknown reason, MUI <TextField /> insists on passing inputRef to <NumberFormat />
// <NumberFormat /> doesn't recognize it, so it passes it to native <input>, which warns about not recognizing it either
const MyNumberFormat = ({ inputRef, ...rest }) => <NumberFormat {...rest} />
