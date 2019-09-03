import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setForm, setList } from '../../../redux/actions'

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
  // As of the move to redux, only schema is in the form component state.
  // That's since schema indeed is only required as long as the form component is mounted.
  // Without the schema being validated, anyway the user will not be routed anywhere else.
  // As soon as the schema is validated, it clears the error fields in the redux global state.
  // From that moment on, schema is not needed anymore, and it can safely be cleared upon unmounting the form component.
  const [schema, setSchema] = useState({})

  const [showChild, setShowChild] = useState(false)

  // ! Lists and form on the other hand are global, hence in redux
  const dispatch = useDispatch()
  const updateList = useCallback(
    ({ name, list }) => dispatch(setList({ name, list })),
    [dispatch]
  )
  const updateForm = useCallback(form => dispatch(setForm(form)), [dispatch])
  const lists = useSelector(store => store.lists)

  const updateLocationAndAddress = form => ({ location, address }) =>
    updateForm({
      ...form,
      values: { ...form.values, location, address },
    })

  const updateLocationAndAddressCallback = useCallback(updateLocationAndAddress)

  const form = useSelector(store => store.form)

  useEffect(() => {
    console.log('FormContainer useEffect. form: ', form)

    setShowChild(true)

    if (!form.values) {
      console.log(
        'form.values is empty. updating redux form selector according to structure'
      )
      const formState = createFormStateFromStructure(structure)
      updateForm(formState)
    }

    // the upper if resinstates previsouly persisted values should they exist
    // this if is for the case persisted values do not include the address
    if (!form.values || !form.values.address)
      getLocationAndAddress().then(updateLocationAndAddressCallback(form))

    setLists({ structure, form, updateList })

    createSchema(structure, lists, setSchema)

    // ! Not using the '[]' mechanism
    // setLists should be re-called whenever either base or quote changes.
    // Ideally, that should be governed in a declarative manner by using the '[]' mechanism
    // Initially I put there [state.values.quote, ...base...]
    // That made the effect get called for every keystroke, even when state.values.quote did *not* change
    //
    // For the time being, I manually trigger it upon field blurring
    // But this is very not reacty: you're not supposed to trigger data fetching,
    // rather you're supposed to declaratively define the data source a component needs, and let react trigger data fetching when proper)
    //
    // In the meanwhile, I've upgrade to CRA 3.0, where it's kind of illegal to leave '[]' dep ('exhaustive dep')
    // This can be an opportunity to use the '[]' declarative mechanism properly,
    //
    // Until I fix it, I skip the eslint rule to focus on more important issues.
    // TODO: Use the '[]' mechanism to declaratively define when lists should get updated
    // TODO: Use a separate useEffect per each list, depending on the value that matters
    // TODO: Then remove the setLists that's being called upon field blurring, which served as a workaround for that.
  }, [
    form,
    lists,
    structure,
    updateForm,
    updateList,
    updateLocationAndAddressCallback,
  ])

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
