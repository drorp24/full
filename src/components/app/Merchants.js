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
      notifyOnNetworkStatusChange={false}
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

export default connect(
  ({ search }) => ({ search }),
  null
)(Merchants)
