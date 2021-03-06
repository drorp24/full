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
import { getCoins, getCurrencies } from './lists'
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

  const lists = useSelector(store => store.lists)
  const populated = useSelector(store => store.app.populated)
  // Unlike lists and app selectors, whose properties are hard-coded hence initialized,
  // form.values' properties are unknown initially as they're dynamically built
  const quote = useSelector(store => (store.form.values || {}).quote)
  const { online } = useSelector(store => store.device)

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
    ({ name, list, quote }) => dispatch(setList({ name, list, quote })),
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

  // *
  // * form values (aka 'state') useEffect
  // *
  useEffect(() => {
    const updateForm = form => dispatch(setForm(form))

    if (!populated.state) {
      updateForm(createFormStateFromStructure(structure))
      updatePopulated('state')
    }
  }, [populated.state, structure, dispatch, updatePopulated])

  // currencies list useEffect
  useEffect(() => {
    const updateCurrencies = async () => {
      const name = 'currencies'
      const list = await getCurrencies()
      updateList({ name, list })
      if (!empty(list)) updatePopulated('currencies')
    }

    if (!populated.currencies) {
      console.info('about to call updateCurrencies')
      updateCurrencies()
    }
  }, [populated.currencies, updateList, updatePopulated])

  // *
  // * coins list useEffect
  // *
  // This useEffect is in charge of fetching the coins list, each coin with a rate relative to the quote currency.
  // Since it entails fetching a slow api with lots of data, every attempt is made to prevent calling that api unnecessarily.
  // This is particulalry important since the useEffect depdends on 'quote', whose value changes with every key stroke
  // (including removal keystrokes, such as deleteing "United Stated Dollar" character by character).

  useEffect(() => {
    console.info('coins useEffect')
    const updateCoins = async quote => {
      console.info('updateCoins called')
      const name = 'coins'
      const list = await getCoins({ quote })
      updateList({ name, list, quote })
      updatePopulated('coins')
    }

    // This useEffect will also be entered as soon as list.currencies has been built,
    // which occurs before user selected the quote currency. No use to call the API with no quote currency
    //
    // This is the place to optimistically prefetch a default currency such as 'USD'.
    if (!quote) {
      console.info('No quote currency')
      return
    }

    // No use to call it before list.currencies got built
    // This could occur for instance if user selected the 'base' currency first and the currecny list has not been fully built.
    if (!lists.currencies) {
      console.info('currencies list isnt built yet')
      return
    }

    // No use to call the API if the keyed quote currency is not found in the fetched currencies list.
    // No use to call it as of when 'quote' holds the currency full name either (e.g, "United States Dollar") and is deleted back character by character.
    //
    // No use to even look for the quote in the currencies list if
    // - currencies list isn't fetched yet, or
    // - the quote currency dosen't contain at least 3 chars
    const found =
      lists.currencies &&
      quote.length >= 3 &&
      lists.currencies.find(currency => currency.name === quote)

    if (!found) {
      console.info(
        `quote ${quote} has <3 chars or isnt included in currencies list`
      )
      return
    }

    //No need to call it if the coins list is built already with rates relative to the given quote currency
    if (lists.quote === quote) {
      console.info(
        `coins list already has rates for ${quote} - no need to re-fetch it`
      )
      return
    }

    console.info(`Calling updateCoins for quote currrency ${quote}`)
    updateCoins(quote)
    //
  }, [quote, lists.quote, lists.currencies, updateList, updatePopulated])

  // ! Iterate API attempts vs. refresh
  // Finding user's location takes some time, and may require a number of intervaled attempts until info is there.
  // That's why I iterate over location detection down below, with a few seconds lapse b/w one attempt to another.
  // APIs such as getCurrencies on the other hand either succeed or, if not, should not be instantly re-attempted.
  // In their case, user would better reload the page which will end up in the proper useEffect which will make another attempt.

  // *
  // * address useEffect
  // *
  useEffect(() => {
    if (!online) {
      console.info('offline - will not locateUser')
      return
    }
    const updateFormValues = values => dispatch(setFormValues(values))

    const locateUser = async attempts => {
      // ! loop of asynchroneous attempts
      // The following code attempts to locate the user.
      // It does so by awaiting each of the return results of each attempt (an async operation),
      // then attempting again if unsuccessful but not before waiting 3 seconds.
      // This loop ends after maximum 5 attempts.
      // the 3 seconds lapse prevents thousands of attempts from occurring successively,
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
      // using the 'promise' syntax would not cut it, as we have no other function to chain to the promise;
      // instead we want to wait a couple of seconds doing nothing before proceeding to the loop's next iteration.
      // The 'await' syntax allows to not chain anything to the 'delay' function, which is what we want.
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
  }, [dispatch, online])

  const properties = {
    structure,
    show,
  }

  // ! ssr road block
  // The following "road block" on populated.state ensures that render will not take place until form's state population is complete (it's async).
  // And since state is populated by a useEffect which only runs on the client, it also blocks the server from rendering anything beyond this point.
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
