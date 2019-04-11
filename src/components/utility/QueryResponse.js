// A generic GraphQL response, yielding a Loader, a page with Messages or a List
// Result handling (here) and list windowing (List) are entirely generic
// What to render is passed in the 'component' render prop
import React from 'react'
import Messages from '../utility/Messages'
import Loader from '../utility/Loader'
import List from '../list/WindowedList'
// import List from '../list/NonWindowedList' // The non react-window, .map solution, that eagerly renders and scrolls the entire page

const QueryResponse = ({
  loading,
  error,
  data,
  fetchMore,
  entity,
  component,
}) => {
  if (loading) return <Loader />

  if (error) {
    const errors = error.graphQLErrors || [error.networkError]
    const kiy = error.graphQLErrors ? 'message' : null
    return <Messages title="GraphQL Error" array={errors} kiy={kiy} />
  }

  if (!(data && data[entity])) {
    return (
      <Messages title="No data" array={['Something went wrong!']} kiy={null} />
    )
  }

  const { records, cursor, hasMore } = data[entity]

  if (!records.length) {
    return <Messages title="No records" array={['No merchants']} kiy={null} />
  } else {
    return (
      <List {...{ fetchMore, entity, component, records, cursor, hasMore }} />
    )
  }
}

export default QueryResponse
