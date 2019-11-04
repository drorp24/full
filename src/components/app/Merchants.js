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

// ! Apollo's useQuery hook could save a lot of boilerplate
// Apollo client now enables getting the results ({loading, error, data, fetchMore}) using a hook (useQuery) rather than a render prop.
// So I could avoid using <Query /> and the {({loading, error, data, fetchMore })} render prop inside of it altogether,
// letting <Merchants /> access the GraphQl response directly with useQuery hook.
//
// TODO: Make it generic
// The internal 2 layers (<QueryResponse /> and <WindowedList />) are already query-agnostic (generic):
// they get the 'data', 'Merchant' component and 'merchants' entity name as props
// and are only concerned with rendering that data as a windowed list of 'Merchant's, not knowing or caring what the data is.
// 'Merchant', this component, is not generic but the only thing that nakes it not generic is the imports of the merchantsQuery and the mapping;
// Since 99% of the Merchants code is generic (not that there's a lot left once the hook form is used), it makes more sense to make it
// generic too, and pass the non-generic query and the mapping as props.
// Otherwise, when I have another such list I would have to copy & paste everything in 'Merchants' other than the imports.
//
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
        {({ loading, error, data, fetchMore }) => {
          console.log('+++ Query result (render props / hook) +++')
          console.log('loading: ', loading)
          console.log('error: ', error)
          console.log('data: ', data)
          console.log('+++ +++')
          return (
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
          )
        }}
      </Query>
      <A2HSPrompt />
    </Page>
  )
}

export default Merchants
