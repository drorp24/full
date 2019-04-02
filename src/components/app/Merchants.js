import React from 'react'
import Page from '../page/Page'
import { connect } from 'react-redux'
import { Query } from 'react-apollo'

import merchants from '../../queries/nearbyMerchants'
import QueryResponse from '../utility/QueryResponse'
import Merchant from './Merchant'

const Merchants = ({ search }) => (
  <Page title="Merchants">
    <Query
      query={merchants}
      variables={search}
      fetchPolicy="cache-and-network"
      errorPolicy="all"
      notifyOnNetworkStatusChange={true}
    >
      {({ loading, error, data, fetchMore }) => (
        <QueryResponse
          {...{
            loading,
            error,
            data,
            fetchMore,
            entity: 'merchants',
            component: Merchant,
          }}
        />
      )}
    </Query>
  </Page>
)

// const renderMerchants = ({ component, data, entity, fetchMore }) => {
//   const Component = component
//   const { records, cursor, hasMore } = data[entity]

//   return (
//     <>
//       {records.map(record => (
//         <Component record={record} key={record.id} />
//       ))}
//       {hasMore && (
//         <Button
//           onClick={() =>
//             fetchMore({
//               variables: {
//                 pagination: {
//                   after: cursor,
//                   count: 1,
//                   sortKey: '_id',
//                   sortOrder: 'ascending',
//                 },
//               },
//               updateQuery: (prev, { fetchMoreResult }) => {
//                 const { cursor, hasMore } = fetchMoreResult[entity]
//                 const records = [
//                   ...prev[entity].records,
//                   ...fetchMoreResult[entity].records,
//                 ]

//                 return {
//                   [entity]: {
//                     cursor,
//                     hasMore,
//                     records,
//                     __typename: prev[entity].__typename,
//                   },
//                 }
//               },
//             })
//           }
//         >
//           More
//         </Button>
//       )}
//     </>
//   )
// }

export default connect(
  ({ search }) => ({ search }),
  null
)(Merchants)
