// A generic GraphQL response, yielding a Loader / a page with Messages / or a List
// ApolloClient Query 'loading' is actually ignored and empty 'data' is used instead because of the inifinite loading mechanism used
// Result handling (here) and list windowing and inifinite loading (handled by WiundowedList) are entirely generic
// The only non-generic thing is what component to render for every item, which is passed in the 'component' render prop
import React from 'react'
import Messages from '../utility/Messages'
import Loader from '../utility/Loader'
import WindowedList from '../list/WindowedList'
// import List from '../list/NonWindowedList' // The non react-window, .map solution, that eagerly renders and scrolls the entire page

// ! InfiniteLoader implies different behavior of Apollo Client Query's render function:
// When InfiniteLoader is used as in this case, the server is called repeatedly instead of just once
// making each such call return here, with 'loading' = true
// that 'loading' should not render anything or else whatever it renders will flush the UI.
// Instead, initial loading is identified by empty 'data' (rendering the animated <Loader /> in this case)
// (unlike 'loading', data would never be empty again in its next returns here, so it won't flush the already displayed records)
// whereas pagination 'Loading...' is identified on the record level (using InfiniteLoader's isItemLoaded) and displayed on the record level too
// (by defining InfiniteLoader's itemCount to the already fetched records length + 1 I made 'Loading...' show on one single record only, but that's entirely UI)
// Query's 'loading' itself is used to prevent InfiniteLoader's loadMoreItems from calling the same page more than once if that page is already loading
const QueryResponse = ({
  loading,
  error,
  data,
  fetchMore,
  entity,
  component,
}) => {
  // Forbidden for InfiniteLoader, see above
  // if (loading) {}

  // This is used instead
  if (!(data && data[entity])) return <Loader />

  if (error) {
    const errors = error.graphQLErrors || [error.networkError]
    const kiy = error.graphQLErrors ? 'message' : null
    return <Messages title="GraphQL Error" array={errors} kiy={kiy} />
  }

  const { records, cursor, hasMore } = data[entity]

  if (!records.length) {
    return <Messages title="No records" array={['No merchants']} kiy={null} />
  } else {
    return (
      <WindowedList
        {...{ loading, fetchMore, entity, component, records, cursor, hasMore }}
      />
    )
  }
}

export default QueryResponse
