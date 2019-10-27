import React from 'react'
import Page from '../page/Page'
import { useSelector } from 'react-redux'
import { Query } from 'react-apollo'

import merchantsQuery, {
  mapFormToMerchantQueryVariables,
} from '../../queries/merchantsQuery'
import QueryResponse from '../utility/QueryResponse'
import Merchant from './Merchant'
import A2HSPrompt from '../utility/A2HSPrompt'

// Apollo client now enables getting the results ({data, loading etc}) by calling useQuery with the query as its arguments
// Query isn't needed anymore  https://www.apollographql.com/docs/react/features/pagination/#cursor-based
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
      <A2HSPrompt />
    </Page>
  )
}

export default Merchants
