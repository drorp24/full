// A generic GraphQL response, yielding a Loader, a page with Messages or a List
// Result handling (here) and list windowing (List) are entirely generic
// What to render is passed in the 'component' render prop
import React from 'react'
import Messages from '../utility/Messages'
import Loader from '../utility/Loader'
import List from '../list/WindowedList'
// import List from '../list/NonWindowedList' // The non react-window, .map solution, that eagerly renders and scrolls the entire page

// ! InfiniteLoader implies different behavior of Apollo Client Query's render function:
// When InfiniteLoader is used as in this case, the server is called repeatedly instead of just once
// making each such call return here, with 'loading' = true
// that 'loading' should not render anything or else whatever it renders will flush the UI.
// Instead, empty 'data' identifies the *initial* loading state and renders the appropriate <Loader />:
// Unlike 'loading', data would never be empty again in its next returns here, so it won't flush the already displayed records.
// As for 'loading', it is passed on to 'List' so that InfiniteLoader's loadMoreItems would prevent duplicate calls to the server
// Pagination 'Loading...' indicators are displayed by adding an extra record to the UI and leaving it with 'Loading...' until that record is populated in 'records'
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
      <List
        {...{ loading, fetchMore, entity, component, records, cursor, hasMore }}
      />
    )
  }
}

export default QueryResponse
