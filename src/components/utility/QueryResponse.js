import React from 'react'
import Messages from '../utility/Messages'
import Merchant from '../app/Merchant'
import Loader from '../utility/Loader'

const QueryResponse = ({ loading, error, data, entity, component }) => {
  if (loading) return <Loader />
  if (error) {
    return (
      <Messages
        title="GraphQL Error"
        array={error.graphQLErrors || [error.networkError]}
        kiy={error.graphQLErrors ? 'message' : null}
      />
    )
  }
  if (data) {
    // * Dynamic component name in action!
    const Component = component
    if (data[entity] && data[entity].length) {
      return data[entity].map(record => (
        <Component record={record} key={record.id} />
      ))
    } else {
      return (
        <Messages
          title="No records"
          array={['No merchants matched this query']}
          kiy={null}
        />
      )
    }
  } else {
    return (
      <Messages title="No data" array={['Something went wrong!']} kiy={null} />
    )
  }
}

export default QueryResponse
