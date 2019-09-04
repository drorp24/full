import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setForm, setFormValues, setList } from '../../../redux/actions'

import DotsMobileStepper from './DotsMobileStepper'
import OneStepper from './OneStepper'
import {
  createFormStateFromStructure,
  createSchema,
  setLists,
} from '../../forms/utilities/formUtilities'
import { getLocationAndAddress } from '../../utility/geolocation'
import LiveRates from '../../websocket/LiveRates'
import { MyTypography } from '../../themed/Box'
import { coinbaseProducts } from '../../forms/utilities/lists'

const FormContainer = ({ structure, show }) => {
  // ! Schema is really only required during the life span of the form component, hence it's in its local state
  // ! Lists and form on the other hand are global, hence in redux
  // As of the move to redux, only schema is in the form component state.
  // That's since schema indeed is only required as long as the form component is mounted.
  // Without the schema being validated, anyway the user will not be routed anywhere else.
  // As soon as the schema is validated, it clears the error fields in the redux global state.
  // From that moment on, schema is not needed anymore, and it can safely be cleared upon unmounting the form component.
  const [schema, setSchema] = useState({})
  const [showChild, setShowChild] = useState(false)

  const dispatch = useDispatch()

  const lists = useSelector(store => store.lists)
  const form = useSelector(store => store.form)

  const updateList = useCallback(
    ({ name, list }) => dispatch(setList({ name, list })),
    [dispatch]
  )
  const updateForm = useCallback(form => dispatch(setForm(form)), [dispatch])
  const updateFormValues = useCallback(
    values => dispatch(setFormValues(values)),
    [dispatch]
  )

  useEffect(() => {
    console.log('FormContainer useEffect started')

    const updateLocationAndAddress = () => {
      getLocationAndAddress().then(({ location, address }) => {
        updateFormValues({ location, address })
      })
    }

    setShowChild(true)

    if (!form.values) {
      console.log(
        'form selector and values dont exist. Creating them and updating store'
      )
      const formState = createFormStateFromStructure(structure)
      updateForm(formState)
    } else {
      console.log('form selector and values exist')
    }

    // the upper if resinstates previsouly persisted values should they exist
    // this if is for the case persisted values do not include the address
    if (!form.values || !form.values.address) {
      console.log(
        'address doesnt exist. Getting location & address and updating store once they are available'
      )
      updateLocationAndAddress()
    } else {
      console.log('address exists')
    }

    if (!lists || !Object.keys(lists).length) {
      console.log('lists dont exist. Creating them and updating store')
      setLists({ structure, form, updateList })
    } else {
      console.log('lists exist')
    }

    if (!Object.keys(schema).length) {
      console.log('schema doesnt exist. Generating it and updating store')
      createSchema(structure, lists, setSchema)
    } else {
      console.log('schema exists')
    }

    // ! Using the '[]' mechanism properly
    // Currently 'setLists' gets re-called whenever field blurs
    // That's a very non-reacty way of triggerring a useEffect.
    // The proper way would be to separate the setLists into its own separate useEffect, and have currency and coin as its dependencies.
    // That way, whenever a currency or coin form value changes, that useEffect gets called.
    // TODO: replace blur event trigger with a separate useEffect for setLists whose dependencies are currency and coin values.
    // Note: I did try already putting there [state.values.quote, ...base...] but that made the effect get called for every keystroke, even when state.values.quote did *not* change
  }, [form, lists, structure, updateForm, updateList, schema])

  const header = form => {
    if (!form.values) return <div />
    const { title, subtitle } = structure[0]
    const { base, quote, amount } = form.values
    const quantity = amount || 1
    const selected = base && quote
    const getting = amount ? `${String(amount)} ${base}` : base
    return (
      <>
        <MyTypography component="div" formVariant="typography.title">
          {selected ? getting : title}
        </MyTypography>
        <MyTypography component="div" formVariant="typography.subtitle">
          {selected && coinbaseProducts.includes(`${base}-${quote}`) ? (
            <LiveRates {...{ base, quote, quantity }} />
          ) : (
            subtitle
          )}
        </MyTypography>
      </>
    )
  }

  const properties = {
    structure,
    schema,
    show,
    header,
  }

  if (!showChild) {
    // You can show some kind of placeholder UI here
    return null
  }

  return structure.length > 1 ? (
    <DotsMobileStepper {...properties} />
  ) : (
    <OneStepper {...properties} />
  )
}

export default FormContainer
