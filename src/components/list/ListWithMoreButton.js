import React from 'react'
import Button from '@material-ui/core/Button'

const List = ({ fetchMore, entity, component, records, cursor, hasMore }) => {
  const Component = component
  return (
    <>
      {records.map(record => (
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
}

export default List
