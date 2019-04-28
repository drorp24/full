import React from 'react'
import Page from '../page/Page'
import { useSelector } from 'react-redux'
import { Query } from 'react-apollo'

import merchants from '../../queries/nearbyMerchants'
import QueryResponse from '../utility/QueryResponse'
import Merchant from './Merchant'

const Merchants = () => {
  // Look ma, no connect!
  const search = useSelector(state => state.search)
  return (
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
}

export default Merchants
