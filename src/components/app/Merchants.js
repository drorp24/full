import React from 'react'
import Page from '../page/Page'
import { useSelector } from 'react-redux'
import { Query } from 'react-apollo'

import merchantsQuery, {
  mapFormToMerchantQueryVariables,
} from '../../queries/merchantsQuery'
import QueryResponse from '../utility/QueryResponse'
import Merchant from './Merchant'

const Merchants = () => {
  // Look ma, no connect!
  const form = useSelector(state => state.form)
  const merchantsQueryVariables = mapFormToMerchantQueryVariables(form)
  return (
    <Page title="Merchants">
      <Query
        query={merchantsQuery}
        variables={merchantsQueryVariables}
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
