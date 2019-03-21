import { gql } from 'apollo-boost'

const NearbyMerchants = gql`
  query NearbyMerchants(
    $product: Product!
    $amount: Float!
    $service: Service
    $area: Area
    $results: Results
  ) {
    merchants(
      product: $product
      amount: $amount
      service: $service
      area: $area
      results: $results
    ) {
      id
      name
      address
      name_he
      delivery
      phone
      quote(product: $product, amount: $amount) {
        base
        quote
        amount
        price
        created
      }
    }
  }
`

export default NearbyMerchants
