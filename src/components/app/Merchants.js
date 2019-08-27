import React from 'react'
import Page from '../page/Page'
import { useSelector } from 'react-redux'
import { Query } from 'react-apollo'

import merchantsQuery, {
  mapFormToMerchantQueryVariables,
} from '../../queries/merchantsQuery'
import QueryResponse from '../utility/QueryResponse'
import Merchant from './Merchant'
import NoSsr from '@material-ui/core/NoSsr'

const Merchants = () => {
  // Look ma, no connect!
  const form = useSelector(state => state.form)
  const merchantsQueryVariables = mapFormToMerchantQueryVariables(form)
  return (
    <NoSsr>
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
    </NoSsr>
  )
}

export default Merchants
