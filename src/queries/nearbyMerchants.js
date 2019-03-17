import { gql } from 'apollo-boost'

const NearbyMerchants = gql`
  query NearbyMerchants(
    $currency: String!
    $area: Area!
    $services: Services!
    $results: Results
  ) {
    merchants(
      currency: $currency
      area: $area
      services: $services
      results: $results
    ) {
      id
      name
      address
      name_he
      delivery
      phone
      quotation(currency: $currency) {
        buy
      }
    }
  }
`

export default NearbyMerchants
