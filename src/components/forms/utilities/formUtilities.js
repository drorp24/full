import React from 'react'
import merge from 'lodash.merge'
import { makeStyles } from '@material-ui/styles'
import capitalize from '../../utility/capitalize'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import FormLabel from '@material-ui/core/FormLabel'
import FormControl from '@material-ui/core/FormControl'
import { Box, MyTypography } from '../../themed/Box'
import Page from '../../themed/Page'
import 'react-phone-number-input/style.css'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import { FormHelperText } from '@material-ui/core'

// Unlike classes' setState, hooks' setState does not automatically merge update objects (why?)
// I could do (and did) that with spread operator, as long as I used the setState's function form,
// but spread operator will handle one level only, whereas lodash.merge will handle all levels recursively
// so lodash.merge should be the go-to solution for setState when it comes to hooks
export const handleBlurGeneric = ({ props: e, state, setState }) => {
  const { name } = e.target

  setState(merge(state, { touched: { [name]: true } }))
}

//Unlike Formik, I set 'touched' as soon as a change is made
export const handleChangeGeneric = ({ props: e, state, setState, schema }) => {
  const { name, value } = e.target

  const check = (field, value) => {
    try {
      schema.validateSyncAt(field, {
        [field]: value,
      })
      return false
    } catch (error) {
      return capitalize(error.message)
    }
  }
  const error = check(name, value)

  const changeToMerge = {
    values: { [name]: value },
    touched: { [name]: true },
    errors: { [name]: error },
  }

  setState(merge(state, changeToMerge))
}

const handlePhoneChangeGeneric = ({ value, state, setState, schema }) => {
  const sValue = String(value)

  const error = isValidPhoneNumber(sValue) ? null : 'Phone number required'

  const changeToMerge = {
    values: { phone: sValue },
    touched: { phone: true },
    errors: { phone: error },
  }

  setState(merge(state, changeToMerge))
}

const useStyles = makeStyles(theme => ({
  root: {
    background: 'inherit',
    borderBottom: '1px solid rgba(0, 0, 0, 0.42) !important',
  },
  error: {
    borderBottomColor: `${theme.palette.error.main} !important`,
  },
}))

const propAdaptationUseStyles = makeStyles(theme => {
  console.log(
    'propAdaptationUseStyles called (you will see this msg once only!)'
  )

  return {
    root: {
      background: props => {
        console.log('color function called with props:', props)
        const result = props.value > 100 ? 'yellow' : 'none'
        console.log('will return ', result)
        return result
      },
    },
  }
})

export const withState = ({ state, setState, schema }) => func => props =>
  func({ props, state, setState, schema })

export const multiStepFormValidGeneric = (steps, step, state) => {
  const result =
    Object.entries(state.errors).filter(
      entry => entry[1] && steps[step].fields.some(i => i.name === entry[0])
    ).length === 0

  return result
}

const FormContext = React.createContext()

// Oddly, Form is called for *each* keystroke of each field
// Field used to do that too, but stopped as soon as its Memo version was used
// However React.memo'ing Form didn't help with Form
//
// Form will work just as fine with a single step form
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

// Field doesn't need to be exposed: Form iterates over Field using structure and schema props
// However I used context rather than props to enable Field to be exported out easily if needed (and to play with it, of course)
const Field = ({ name, noError = false }) => {
  console.log('Field called')

  return (
    <FormContext.Consumer>
      {({ state, setState, schema, structure, step }) => {
        // This component updates a state that belongs to its ancestor component
        const handleBlur = e => {
          withState({ state, setState, schema })(handleBlurGeneric)(e)
        }
        const handleChange = e => {
          withState({ state, setState, schema })(handleChangeGeneric)(e)
        }

        const handlePhoneChange = value => {
          handlePhoneChangeGeneric({ value, state, setState, schema })
        }

        const field = structure[step].fields.filter(
          field => field.name === name
        )[0]

        const { type, required, options, helper } = field

        const { values, touched, errors } = state

        const showError = !noError && touched[name] && !!errors[name]

        return (
          <div>
            {name === 'phone' ? (
              <PhoneField
                name={'phone'}
                type={type}
                label={capitalize(name)}
                country="IL"
                placeholder="Enter phone number"
                value={values[name]}
                onBlur={handleBlur}
                onChange={handlePhoneChange}
                required={required}
                error={showError}
                helperText={showError ? errors[name] : helper}
                fullWidth
              />
            ) : (
              <TextField
                name={name}
                type={type}
                label={capitalize(name)}
                value={values[name]}
                onBlur={handleBlur}
                onChange={handleChange}
                required={required}
                select={!!options}
                error={showError}
                helperText={showError ? errors[name] : helper}
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
            )}
          </div>
        )
      }}
    </FormContext.Consumer>
  )
}

// Unless memoized, Field gets rendered 3 (!) unnecessary times for each keystroke!
const MemoField = React.memo(Field)

// Using the classNames approach, as prop adaptation doesn't work here
const PhoneField = props => {
  const {
    error,
    fullWidth,
    required,
    label,
    country,
    placeholder,
    value,
    onChange,
    helperText,
  } = props

  const classes = useStyles(props)
  return (
    <>
      <FormControl error={error} fullWidth={fullWidth}>
        <FormLabel required={required} style={{ fontSize: '0.75rem' }}>
          {label}
        </FormLabel>
        <PhoneInput
          country={country}
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
    </>
  )
}

// This shows that prop adaptation does work well with a MUI component and a className prop
//
// To use it, useStyles needs to be called with the props which
// would be fed into the styling function within the makeStyles hook
//
// console logs shows that the ...useStyles hook called by the below function is called once only, though
// the function itself is being called again for each keystroke (which makes perfect sense).
// What's being called for every invocation (= keystroke) is the styling function that reacts to the prop changes.
//
// devTools shows the classname hasn't changed.
// However, confusingly it also doesn't change the class' contents, contradicting the browser which does obey the new content
//
// const PropAdaptationTextField = props => {
//   console.log('before declaring classes')
//   const classes = propAdaptationUseStyles(props)
//   console.log('after declaring classes')
//   return (
//     <TextField {...props} className={classes.root}>
//       {props.children}
//     </TextField>
//   )
// }
