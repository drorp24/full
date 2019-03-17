import React from 'react'
import { Query } from 'react-apollo'

import merchants from '../../queries/nearbyMerchants'

export default ({ variables }) => (
  // errorPolicy="all" doesn't work when returned status is 400 though the file includes a json
  <Query query={merchants} variables={variables} errorPolicy="all">
    {({ loading, error, data }) => (
      <>
        {loading && <p>Loading...</p>}
        {error && <p>Error!</p>}

        {data &&
          data.merchants &&
          data.merchants.map(merchant => (
            <p key={merchant.id}>{merchant.name}</p>
          ))}
      </>
    )}
  </Query>
)
