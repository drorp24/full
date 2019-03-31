import React from 'react'
import Messages from '../utility/Messages'
import Merchant from '../app/Merchant'
import Loader from '../utility/Loader'
import Button from '@material-ui/core/Button'

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
    return (
      <Messages
        title="GraphQL Error"
        array={error.graphQLErrors || [error.networkError]}
        kiy={error.graphQLErrors ? 'message' : null}
      />
    )
  }
  if (data && data[entity]) {
    const { records, cursor, hasMore } = data[entity]
    if (records.length) {
      const Component = component
      return (
        <>
          {data[entity].records.map(record => (
            <Component record={record} key={record.id} />
          ))}
          {hasMore && (
            <Button
              onClick={() =>
                fetchMore({
                  variables: {
                    pagination: {
                      after: cursor,
                      count: 1,
                      sortKey: '_id',
                      sortOrder: 'ascending',
                    },
                  },
                  updateQuery: (prev, { fetchMoreResult }) => {
                    const { cursor, hasMore } = fetchMoreResult[entity]
                    const records = [
                      ...prev[entity].records,
                      ...fetchMoreResult[entity].records,
                    ]

                    return {
                      [entity]: {
                        cursor,
                        hasMore,
                        records,
                        __typename: prev[entity].__typename,
                      },
                    }
                  },
                })
              }
            >
              More
            </Button>
          )}
        </>
      )
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
