import React, { Suspense, useContext, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setForm } from '../../../redux/actions'
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
import Cancel from '@material-ui/icons/Cancel'

import { object } from 'yup'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import NumberFormat from 'react-number-format'
import { TimePicker, MuiPickersUtilsProvider } from 'material-ui-pickers'
import DateFnsUtils from '@date-io/date-fns'
import MuiAutosuggest from '../utilities/MuiAutosuggest'

import { Box, Row } from '../../themed/Box'
import capitalize from '../../utility/capitalize'
import Loader from '../../utility/Loader'
// import { mark } from '../../utility/performance'
import LocationSearchInput from './LocationSearchInput'
import { geocode } from '../../utility/geolocation'

import getSymbolFromCurrency from 'currency-symbol-map'
import { empty } from '../../utility/empty'
import { BrowserContext } from '../../utility/BrowserContext'
import ErrorBoundary from '../../utility/ErrorBoundary'

//
// A. Utility functions to create/modify state
//
export const createFormStateFromStructure = structure => {
  const form = { values: {}, touched: {}, errors: {} }
  const { values, touched, errors } = form

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

  return form
}

// ! Generating the lists dynamically: not always possible
// Generating all lists mentioned in the configuration (e.g., Select) is a nice idea but not always possible.
// While currency list can be generated once, coins list needs to be re-generated every time the currency changes.
// That's why FormContainer has one initialization useEffect that generates the currency list,
// and another useEffect to generate the coins list that depends on the currency value and re-generates it every time it changes.
// The below code is from the time I thought I could just dynamically generate every list mentioned in the confiuration.
//
// export const setLists = ({ structure, quote, updateList}) => {
//   getFields(structure)
//     .filter(field => !!field.list)
//     .forEach(({ list }) => {
//       setList({ list, quote, updateList })
//     })
// }

// ! Generating the schema dynamically: not required
// After much struggle with yup, I'm documenting the ultimate conclusions to hopefully save more struggles going forward.
//
// * Once thought to be required to generate oneOf rules dynamically, based on lists
// Using oneOf rules in yup is kind of okay if the lists are short and hard-coded, though there are more reasons to not use it even then.
// But generating a long oneOf rule based on a list (e.g., currencies) is always a bad idea as I discovered:
// - Technically, it entails using a setTransform function in redux-persist, which would convert the yup whitelists that serve its oneOf rules
//   from their Set representation into arrays when persisting, then back to Sets when rehydrating redux.
//   This is annoying, as you have to traverse the schema structure, hard-code the Set's name in it and use Immer's produce since it's burried deep in the schema object. Yach.
// - Effectively, when yup sees a oneOf rule, it essentially overrides all other rules (since 'oneOf' kinds of make the other rules redundant).
//   The result is that user gets only one error message: this is not a valid value.
//   On the other hand, when no oneOf rule is specified, then there can be used a number of rules that would help user such as: pick 3 characters,
//   all of them must be capitals etc.
// - Lastly, if the list of valid values is long, yup wouldn't anyway detail it on the line and there would be some kind of AutoSuggest
//   so it's pointless to let yup warn the user, who see the list and doesn't pick any value off it.
//   A general warning to pick from the list would be in place, but certainly yup doesn't need to store the entire list of values.
// - If that's not enough, the consolidated schema captured a lot of space; having to persist it means capturing a lot of space.
//
// * "schema.validateSyncAt is not a function" error
//
//   This misleading error message is - probably - the result of a oneOf rule that can't work properly.
//   It was raised after redux store was rehydrated, making the _whitelist Set empty.
//   That was before I added the setTransform function, and stopped occuring once I did.
//   It was also raised when I appended a oneOf rule in the configuration itself to a string() which also had length().
//   According to yup documentation, oneOf can be applied to a mixed object only.
//   Another reason to not use oneOf with yup.
//
// * Don't generate schema
//
//   One of the driving forces behind 'generating' a schema was that it will enable adding rules programmatically,
//   such as the list-based oneOf rules.
//   With them out of the way, there's no reason to accumulate the field schemas in the configuration into one consolidated schema.
//   yup schema is a configuration, and the hard-coded fieldSchemas configured should be enough.
//
export const createSchema = (structure, lists) => {
  const shape = {}

  getFields(structure).forEach(({ name, fieldSchema, list }) => {
    shape[name] = fieldSchema
    const fetchedList = lists[list]
    if (fetchedList) {
      const permittedValues = fetchedList.map(item => item.name)
      shape[name] = fieldSchema.oneOf(
        permittedValues,
        'Please select from the list'
      )
    }
  })
  return object(shape)
}

//
// B. Form and sons: components & styling
//
const FormContext = React.createContext()

// External libraries whose customization requires passing className (e.g. in 'InputProps')
// require using makeStyles, which generates an obj named 'classes' with a className for each first-level (only!) key here.
// If I just need to style any of my *own* components then useTheme will give me direct access to theme
// but useTheme does not generate className's.
const useFormStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
    width: '100%',
  },
  primary: {
    color: theme.palette.primary.main,
  },
  label: theme.form.body.fields.label,
  phone: {
    background: 'inherit',
    borderBottom: '1px solid rgba(0, 0, 0, 0.42) !important',
    color: theme.palette.primary.main,
  },
  error: {
    borderBottomColor: `${theme.palette.error.main} !important`,
  },
}))

const Fields = ({ structure, step }) =>
  structure[step].fields.map(({ name }) => <MemoField name={name} key={name} />)

// ! Why 'Form' is called for each and every keystroke
// Form has a useSelector on 'form', and the latter changes with every keystroke.
// A useSelector behaves like prop, in that it triggers a re-render every time its values changes.
// useSelector is a recent addition, but most of formUtilities was written when there were no hooks around, and that is the key to this behavior:
//
// EveryField needs 'form' in its entirety to continue to be generic, and there are other things Form provides in its context.
// It used to be cumbersome to provide a context so I used to combine and hoist them, let alone redux direct access by a component.
// Nowadays I'd probably split the contexts so that only EveryField passes it
// or better yet, let each field get only the value it needs by accessing redux directly rather than getting it from a context.
// Luckily, React doesn't really re-renders the entire Form DOM element, only what's actually changed.
export const Form = ({ structure, show, step, header, footer }) => {
  const classes = useFormStyles()
  const form = useSelector(store => store.form)
  const dispatch = useDispatch()
  const updateForm = useCallback(form => dispatch(setForm(form)), [dispatch])

  return (
    <FormContext.Provider value={{ structure, step, show, form, updateForm }}>
      <form autoComplete="off" className={classes.root}>
        <Box formVariant="header">{header && header(form)}</Box>
        <Box formVariant="body" formColor="body.color">
          <Fields {...{ structure, step }} />
        </Box>
        <Box formVariant="footer">{footer && footer(step)}</Box>
      </form>
    </FormContext.Provider>
  )
}

Form.propTypes = {
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
  <FormContext.Consumer>
    {({ structure, step, show, form, updateForm }) => {
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
        clearable,
      } = field
      const {
        values: { [name]: fieldValue },
        touched: { [name]: fieldTouched },
        errors: { [name]: fieldError },
      } = form
      const error = !show.noError && fieldTouched && !!fieldError
      const helperText = error ? fieldError : show.helper ? helper : ' '
      const fieldLabel = !show.label ? '' : label ? label : capitalize(name)
      const fieldOptions =
        typeof options === 'function' ? options(form) : options
      const value =
        typeof fieldValue === 'function' ? fieldValue(form) : fieldValue
      const onChange = onChangeFor({
        name,
        type,
        fieldSchema,
        form,
        updateForm,
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
        list,
        uniqProps,
        clearable,
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

// * Generate a dynamic (run-time) component name
// This is the way to include a dynamic Component whose name is derived from a prop (in this case, 'type')
// There's no 'Display' Component per ce, it's just a cover for a host of other components
// Dynamic component is for cases where different components all require the same props but each does differet things with these same props
const DisplayField = ({ type, ...rest }) => {
  const browserContext = useContext(BrowserContext)
  const { online } = browserContext

  const display = {
    phone: PhoneField,
    switch: SwitchField,
    number: NumberField,
    time: TimeField,
    autosuggest: AutosuggestField,
    location: LocationField,
    default: DefaultField,
  }

  const Display = display[type]
  return (
    <ErrorBoundary level="line" online={online}>
      <Display {...rest} />
    </ErrorBoundary>
  )
}

DisplayField.propTypes = {
  type: PropTypes.oneOf([
    'phone',
    'switch',
    'number',
    'time',
    'autosuggest',
    'location',
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
  const classes = useFormStyles()
  return (
    <FormControl error={error} fullWidth={fullWidth}>
      <FormLabel className={classes.label} required={required}>
        {label}
      </FormLabel>
      <PhoneInput
        country="IL"
        value={value}
        onChange={onChange}
        inputClassName={
          error
            ? classes.phone + ' ' + classes.error // classNames-style working solution
            : classes.phone
        }
      />
      <FormHelperText component="p">{helperText}</FormHelperText>
    </FormControl>
  )
}

// It's best to separate use<component>style and place it just before the customized component
// since then I can use the very same class names used by the componments I'm customizing
// which are not namespaced (e.g., 'root').]
// It's also more convenient that the custom styles are next to the components
const useSwitchStyles = makeStyles(theme => ({
  root: {
    transform: 'translate(12px)',
  },
  switchLabel: ({ checked }) =>
    !checked
      ? theme.form.body.fields.label.unchecked
      : theme.form.body.fields.label,
}))

// Using a prop ('checked') to create a prop-based dynamic style ('switchLabel')
// 'checked' prop is passed to makeStyles as an argument, and switchLabel is defined as a function of 'checked'
// This reaplaces the 'classNames' solution and is in my mind the most important feature of mui's v4
// It's also the ultimate use case for CSS-in-JS:
// the ability to define styling declaratively: as a function of state (rather than imperatively switching classes back and forth)
const SwitchField = ({ name, value, helper, onChange }) => {
  const classes = useSwitchStyles({ checked: value })
  const { root, switchLabel } = classes
  return (
    <Row>
      <span className={switchLabel}>{helper}</span>
      <Switch
        color="primary"
        name={name}
        checked={value}
        classes={{
          root,
        }}
        onChange={onChange}
      />
    </Row>
  )
}

const NumberField = ({
  name,
  icon,
  value,
  onChange,
  uniqProps,
  clearable,
  ...rest
}) => {
  const classes = useFormStyles()
  const context = useContext(FormContext)
  const { form, updateForm } = context
  const {
    values: { base },
  } = form

  return (
    <TextField
      InputProps={{
        startAdornment:
          showAdornment(icon, value) && IconAdornment({ icon, form }),
        className: classes.primary,
        inputComponent: MyNumberFormat,
        inputProps: {
          value,
          thousandSeparator: true,
          onValueChange: onChange,
          prefix: getSymbolFromCurrency(base),
        },
        // Typically with TextField, 'value' and 'onChange' are props of TextField,
        // that in turn passes them onto the inputComponent, but has to know the value too, as well as error and helpText passed in ...rest
        // this is since it is TextField not the inner component which controls the label state (shrink), error state, and helperText
        // The onChange: () => {} in this case is since MyNumberFormat doesn't recognize 'onChange' but 'onValueChange' instead
        onChange: () => {},
        ...(clearable && {
          endAdornment: <ClearIcon {...{ name, updateForm }} />,
        }),
      }}
      InputLabelProps={{
        className: classes.label,
      }}
      name={name}
      value={value}
      {...rest}
    />
  )
}

// MUI <TextField /> insists on passing inputRef to <NumberFormat />
// <NumberFormat /> doesn't recognize it, so it passes it onwards to native <input>, which complains about not recognizing it either
const MyNumberFormat = ({ inputRef, ...rest }) => <NumberFormat {...rest} />

const TimeField = ({ value, onChange, icon, label, helperText }) => {
  const classes = useFormStyles()
  const context = useContext(FormContext)
  const { form } = context

  return (
    // I'm sure I could use here TextField as well
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
              showAdornment(icon, value) && IconAdornment({ icon, form }),
            className: classes.primary,
          }}
          InputLabelProps={{
            className: classes.label,
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
  const { form } = context
  const lists = useSelector(store => store.lists)
  const entireList = lists[list]

  return (
    <TextField
      InputProps={{
        startAdornment:
          showAdornment(icon, value) && IconAdornment({ icon, form }),
        inputComponent: MuiAutosuggest,
        inputProps: {
          // onBlur,
          entireList,
          quantity: 90,
        },
        disableUnderline: true,
      }}
      InputLabelProps={{
        className: classes.label,
      }}
      onChange={onChange}
      value={value}
      fullWidth={fullWidth}
      {...rest}
    />
  )
}

const LocationField = ({
  name,
  value,
  onChange,
  clearable,
  label,
  fullWidth,
  uniqProps,
  ...rest
}) => {
  const classes = useFormStyles()
  const context = useContext(FormContext)
  const { form, updateForm } = context

  const updateLocation = location =>
    updateForm(
      produce(form, draft => {
        draft.values.location = location
      })
    )
  const updateAddress = address =>
    geocode({ address }).then(location => {
      updateLocation(location)
    })

  return (
    <TextField
      InputProps={{
        inputComponent: LocationSearchInput,
        inputProps: {
          ...(clearable && {
            endAdornment: () => <ClearIcon {...{ name, updateForm }} />,
          }),
          updateAddress,
        },
        disableUnderline: true,
      }}
      InputLabelProps={{
        className: classes.label,
      }}
      value={value}
      onChange={onChange}
      fullWidth={fullWidth}
      label={label}
      {...rest}
    />
  )
}

const DefaultField = ({
  name,
  value,
  icon,
  children,
  clearable = false,
  uniqProps,
  onChange,
  ...rest
}) => {
  const classes = useFormStyles()
  const context = useContext(FormContext)
  const { form, updateForm } = context

  return (
    <TextField
      InputProps={{
        startAdornment:
          showAdornment(icon, value) && IconAdornment({ icon, form }),
        className: classes.primary,
        ...(clearable && {
          endAdornment: <ClearIcon {...{ name, updateForm }} />,
        }),
      }}
      value={value}
      name={name}
      onChange={onChange}
      {...rest}
    >
      {children}
    </TextField>
  )
}

const IconAdornment = ({ icon, form }) => {
  // 'eager' comment forces webpack to include such imports in main chunk
  // rather than having to fetch each during runtime
  // There's no other way either, as omitting this comment will make webpack crash compiling.
  // In this case import() is used to enable using dynamic file names, not for code split (which is not happenning).
  // Remarkably, it doesnt affect the bundle sizes nor the elapsed load time but both are bloated anyway.

  const iconFile = typeof icon === 'function' ? icon(form) : icon
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

//
// C. OnChange functions and validation
//

const handleEveryChange = ({
  name,
  type,
  fieldSchema,
  value,
  form,
  updateForm,
}) => {
  const error = checkByType({ name, type, fieldSchema, value })
  if (type === 'number') value = Number(value)

  updateForm(
    produce(form, draft => {
      const { values, touched, errors } = draft
      values[name] = value
      touched[name] = true
      errors[name] = error
    })
  )
}

const checkByType = ({ name, type, fieldSchema, value }) => {
  if (type === 'phone') return phoneCheck({ name, value })
  if (fieldSchema) return yupCheck({ name, value, fieldSchema })
  return false
}

const phoneCheck = ({ name, value }) =>
  isValidPhoneNumber(String(value))
    ? false
    : `Please enter a valid ${name} number`

const yupCheck = ({ name, value, fieldSchema }) => {
  if (!fieldSchema || empty(fieldSchema)) return false

  try {
    fieldSchema.validateSync(value)
    return false
  } catch (error) {
    return capitalize(error.message)
  }
}

// return an onChange function whose signature matches the one used by the component type
// that returns a single funified unction to deal with any change regardless of type
const onChangeFor = ({ name, type, fieldSchema, form, updateForm }) => {
  const handleChange = ({ name, value }) =>
    handleEveryChange({
      name,
      type,
      fieldSchema,
      value,
      form,
      updateForm,
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
      return (event, target) => {
        if (event && target)
          return handleChange({ name, value: target.newValue })
      }
    case 'location':
      return value => handleChange({ name, value })
    default:
      return ({ target: { name, value } }) => handleChange({ name, value })
  }
}

export const multiStepFormValidGeneric = (steps, step, form) => {
  const result =
    Object.entries(form.errors).filter(
      entry => entry[1] && steps[step].fields.some(i => i.name === entry[0])
    ).length === 0

  return result
}

// Not required if user is forced to populate all fields to have the next/submit button enabled
// Destructuring at its best
export const visitUntouched = ({ form, updateForm, structure, step }) => {
  structure[step].fields.forEach(field => {
    const { name, type } = field
    const {
      touched: { [name]: isTouched },
      values: { [name]: value },
    } = form
    if (isTouched) return
    handleEveryChange({ name, type, value, form, updateForm })
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

const ClearIcon = ({ name, updateForm }) => {
  const classes = useFormStyles()
  const form = useSelector(store => store.form)

  const clearValue = name => () => {
    updateForm(
      produce(form, draft => {
        draft.values[name] = ''
      })
    )
    // should have called handleEveryChange (e.g., to warn if fieldSchema doesn't allow it to stay blank)
  }
  return (
    <span onClick={clearValue(name)} className={classes.primary}>
      <Cancel />
    </span>
  )
}
