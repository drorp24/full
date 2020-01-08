import React, { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  setForm,
  setFormValues,
  setList,
  setPopulated,
} from '../../../redux/actions'

import DotsMobileStepper from './DotsMobileStepper'
import OneStepper from './OneStepper'
import { createFormStateFromStructure } from '../../forms/utilities/formUtilities'
import { getLocationAndAddress } from '../../utility/geolocation'
import LiveRates from '../../websocket/LiveRates'
import { MyTypography } from '../../themed/Box'
import { coinbaseProducts, getCoins, getCurrencies } from './lists'
import { empty } from '../../utility/empty'

const FormContainer = ({ structure, show }) => {
  const dispatch = useDispatch()

  // ! Components' useSelector variables are essentially props: whenever each of them change, the entire component gets re-rendered
  // (indeed that's how old 'connect' communicates them to a component)
  // that means that:
  // - each useSelector var should be assigned to the lowest (most granular) key in the redux store object
  //   That guarantees that the component gets re-rendered only upon changes it cares about, and not re-rendered unnecessarily
  //   (e.g., if I assigned a variable to the entire 'form' selector then FormContainer would have been rerendered each and every keystroke)
  //
  // - the price to pay for assigning the lowest required keys, is that they don't always exists by the time they are first accessed
  //   in my case, for instance, the 'form.values' properties are dynamically generated at one of the useEffects,
  //   but another useEffect (quote) asks about the value of quote useSelector (i.e., store.form.values.quote) when store.form is still null
  //   in such cases the (... || {}) notation can save if statements.
  //
  // ! useEffects' dependency variables are exactly the same: props that trigger re-invocation whenever their values change
  // The fact useEffects are re-invoked whenever any of their dependencies change enables using them as event handlers,
  // but such that depend on data rather than on a user gesture and such that don't need to be linked to any component.
  // I'm doing this here in the 'quote useEffect', that updates the coins list whenever quote currency changes.
  // if 'quote' is not impressive enough example to the power of the dependency array (since I could have used 'onChange' in this case),
  // there are dependencies that don't sit on any component (e.g., schema) and would therefore not be possible with any useEffect
  // and then there is the fact that any useEffect can depend on a multitude of data, which isn't possible with onChange either.
  //
  // ! every useEffect invocation will have a component re-render preceeding it
  // ! or: why is FormContainer being re-rendered upon every keystroke in the 'quote' field
  // The above rule holds even if the useSelector vars doesn't seem to require any re-render of the component, just a side calculation
  // For instance: 'quote' changes trigger re-generation of the coins list.
  // Aparently, this doesn't require any re-rendering of FormContainer (maybe not a good example but never mind)
  // but since quote useEffect depends on 'quote', every keystroke in the 'quote' field will re-invoke it
  // and since that quote useEffect belongs to the FormContainer, FormContainer itself will be re-rendered every keystroke in the 'quote' field
  //
  // I could have separated the only part of the form that cares about lists ('quote' field) into its own component
  // and define the 'quote' useSelector as well as the corresponding useEffect (setLists) there
  // but then I would miss the entire flexibility of my Form 'library' which is completely dynamic based on configuration
  // I could have passed 'quote' as a prop into some child of FormContainer, which would make only that child re-render
  // but then I would again defeat the purpose of having a Form component which is entirely dependant on configuration.
  // Even if I had done any of these, I would merely compete with React's own 'diff' mechanism,
  // which sees that only the minimal part of the DOM (if ever) is updated.

  const lists = useSelector(store => store.lists)
  const populated = useSelector(store => store.app.populated)
  // Unlike lists and app selectors, whose properties are hard-coded hence initialized,
  // form.values' properties are unknown initially as they're dynamically built
  const quote = useSelector(store => (store.form.values || {}).quote)

  // ! useCallback only when needed
  // The recommendation is to hoist functions that don’t need props or state outside of your component,
  // and pull the ones that are used only by an effect inside of that effect.
  //
  // Any function that is used by one single useEffect only should be defined in it
  // In which case it doesn't need to be wrapped in useCallback (nor will it be able to)
  //
  // Doing so will
  // - save the need to wrap every such function with useCallback
  //   (otherwise required to prevent that function from changing with each component rerender, which would also trigger the useEffect)
  // - will enable seeing which variable that function depends upon
  //   (e.g., it could be w/o arguments but depend on a closure var which, if not included as dependency, would create a bug)
  // - will enable using variables local to the useEffect (closures again)
  //
  // Below: updateList and updatePopulated are required by multiple effects, hence defined here and wrapped with useCallback.
  const updateList = useCallback(
    ({ name, list, quote = 'USD' }) => dispatch(setList({ name, list, quote })),
    [dispatch]
  )

  const updatePopulated = useCallback(field => dispatch(setPopulated(field)), [
    dispatch,
  ])

  // ! Using redux-persist to cache expensive metadata
  //
  // Generally, useEffect should refrain from updating any variable it is dependant upon,
  // as updating a variable it depdends upon will immediately re-invoke that useEffect again.
  //
  // any useEffect will be invoked as many times as it updates any variable it depends upon.
  // And if there's nothing to stop that useEffect from updating, it will keep updating and be re-invoked forever.
  // This happened to me when I attempted to locate the user address in an http environment.
  //
  // However, when redux-persisted values need to be kept intact, there is no other way.
  // redux-persisted values are hydrated already by the time the initialization useEffect is called,
  // and its the useEffect's responsibility to not override the persisted values.
  // To achieve that, it needs to check on every variable that requires persistance, whether or not that variable is populated already,
  // so it doesn't override any variable that we want persisted.
  // If the variable doesn't require persistance (e.g., 'location/address') then no such if statement should be placed.
  //
  // It doesn't matter if it asks about the persisted variables themselves or uses different set of variables as I did ('populated'),
  // either way, it needs to update the very variables it checks, which results in immediate re-invocation.
  //
  // But here's the big thing:
  // Not only these re-invocations are inevitable in order to not override redux-persisted values,
  // they happen only once in the lifecycle of localStorage, where redux-persist keeps its persisted values.
  //
  // That means, that all the metadata that the form requires - most of which never changes - awaits ready at the device's memory
  // after just one run - saving the need to ever re-generate them in the lifecycle of the app.
  // In fact, I'm pretty confident that in mobile, these values will keep intact b/w runs (practically forever),
  // as redux keeps them in localStorage, not sessionStorage.
  //
  // In my case, such metadata includes a lot of info which is hard to get by and never changes.
  //
  // - entire list of coins with USD quotes - that require a heavy async API to get,
  // - form's state which is dynamically-generated from configuration (structure) but never changes
  // - and naturally the user's keyed data
  //
  // In a sense, this acts like service worker for meta data.
  //

  // Initialization useEffect
  useEffect(() => {
    const updateForm = form => dispatch(setForm(form))

    // ! Iterate or just refresh
    // Finding user's location takes some time, and may require a number of intervaled attempts until info is there.
    // That's why I iterate over location tracking, with a few seconds lapse b/w one attempt to another.
    // getCurrencies on the other hand is an API that almost always succeeds.
    // It fails (only) if WiFi signal is weak, in which case app would fail anyway.
    // Generally when an API fails due to weak network signal, it's often easier to just refresh and try again
    // rather than filling the code with iterators over every API.
    // 'if (!empty)' ensures we can try again by refreshing.
    // Once app supports offline, this API should anyway come from a cache rather than the network.
    const updateCurrencies = async () => {
      const name = 'currencies'
      const list = await getCurrencies()
      updateList({ name, list })
      if (!empty(list)) updatePopulated('currencies')
    }

    if (!populated.state) {
      updateForm(createFormStateFromStructure(structure))
      updatePopulated('state')
    }

    if (!populated.currencies) {
      console.log(
        'about to call updateCurrencies (see if this msg appears 2 times'
      )
      updateCurrencies()
    }
  }, [
    populated.state,
    populated.currencies,
    structure,
    dispatch,
    updateList,
    updatePopulated,
  ])

  // quote useEffect
  useEffect(() => {
    // This useEffect is in charge of populating the quotes of the selected currency for *each* of the crypto coins
    // this enables viewing all coin quotes when browsing the dropdown coins list.
    // Since it entains invoking a heavy api, attempt is made to prevent calling that api unnecessarily.

    // No use to call the api upon initial render of FormContainer, when the user hasn't yet populated anything into quote
    if (!quote) {
      return
    }

    // No use to call it before list.currencies had a chance to be built
    if (!lists.currencies) {
      return
    }

    // No use to call it before all 3 chars has been typed
    // no use to call it if the quote currency is not included in the currencies list either
    const found =
      lists.currencies &&
      lists.currencies.find(currency => currency.name === quote)

    if (!found) {
      return
    }

    // No need to call it if the coins list is built already and matches the given quote currency
    // if (lists.quote === quote) {
    //   console.log(`coins list matches ${quote} - leaving`)
    //   return
    // }

    const updateCoins = async quote => {
      const name = 'coins'
      const list = await getCoins({ quote })
      updateList({ name, list, quote })
      updatePopulated('coins')
    }

    updateCoins(quote)
    //
  }, [quote, lists.quote, lists.currencies, updateList, updatePopulated])

  // address useEffect
  useEffect(() => {
    const updateFormValues = values => dispatch(setFormValues(values))

    const locateUser = async attempts => {
      // ! loop of asynchroneous attempts
      // The following code attempts to locate the user.
      // It does so by awaiting each the return result of each attempt (an async operation),
      // then attempting again if unsuccessful but not before waiting 3 seconds.
      // This loop ends after maximum 5 attempts.
      // the 3 seconds lapse prevents thousands of attempts from occurring quickly one after the other,
      // and the 5 attempts restriction prevents endless attempts in environments that don't support location tracking
      // (e.g., user has not authorized location tracking, http etc)
      //
      // It's important that the loop takes place within the useEffect itself using some local variable (i)
      // rather than using a component state for a counter.
      // Doing the latter would require incrementing that counter, which in turn would instantly invoke the useEffect again,
      // which would occur instantly and will repeat itself many times (as not enough time has passed to justify another address check),
      // It would naturally also make it impossible to control the time lapse to the next attempt.
      //
      // The lapse b/w one attempt to another requires the 'await' syntax:
      // using the 'promise' syntax would not cut it, as there's no function to perform following the resolution of the 'delay' promise.
      // What we want following the resolution is do nothing; just wait a couple of seconds before proceeding to the loop's next iteration
      // (the '.then' in this case is actually the next iteration).
      //
      const delay = ms => {
        return new Promise(resolve => setTimeout(resolve, ms))
      }

      for (let i = 0; i < attempts; i++) {
        const { location, address } = await getLocationAndAddress()

        if (!location.error) {
          updateFormValues({ location, address })
          break
        } else {
          updateFormValues({ location })
          console.warn('location.error: ', location.error)
          await delay(5000)
        }
      }
    }

    locateUser(5)
  }, [dispatch])

  const header = form => {
    if (!form.values) return <div />

    const { title, subtitle } = structure[0]
    const { base, quote, amount } = form.values
    const quantity = amount || 1
    const selected = base && quote
    const coin =
      (
        (selected &&
          lists.coins &&
          lists.coins.find(coin => coin.name === base)) ||
        {}
      ).display || base
    const getting = amount ? `${String(amount)} ${coin}` : coin
    return (
      <MyTypography component="div" formVariant="typography.header">
        <MyTypography
          component="div"
          formVariant={selected ? 'typography.coinTitle' : 'typography.title'}
        >
          {selected ? getting : title}
        </MyTypography>
        <MyTypography component="div" formVariant="typography.subtitle">
          {selected && coinbaseProducts.includes(`${base}-${quote}`) ? (
            <LiveRates {...{ base, quote, quantity }} />
          ) : (
            subtitle
          )}
        </MyTypography>
      </MyTypography>
    )
  }

  const properties = {
    structure,
    show,
    header,
  }

  // ! ssr road block
  // The following "road block" on populated.state ensures that render will not take place until form's state population is complete (it's async).
  // And since state is populated by a useEffect which only run on the client, it also blocks the server from rendering anything beyond this point.
  //
  // Actually none of FormContainer's code runs on the server, as FormContainer's entire logic in useEffect's.
  //
  // Even if useEffects ran on the server or the code was replaced outside of useEffects, I would choose to exclude such code from ssr:
  // performing time-consuming, async data fetching and/or crunching on the server would defeat the ssr puporse.
  // ssr should only be rendering static, welcome pages, so the user can view or even interact with a page as quickly as possible,
  // while the JS is being loaded and the data is getting fetched.
  //
  // When there's no such useEffect to do the ssr blocking, one can create one, and set a boolean 'showChild' to true inside of that useEffect
  // which would prevent rendering that child on the server (Dan Abramov's trick).
  //
  if (!populated.state) return null

  return structure.length > 1 ? (
    <DotsMobileStepper {...properties} />
  ) : (
    <OneStepper {...properties} />
  )
}

export default FormContainer
