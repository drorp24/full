import { gql } from 'apollo-boost'

const NearbyMerchantsQuery = gql`
  query NearbyMerchants(
    $product: Product!
    $amount: Float!
    $service: Service
    $area: Area
    $pagination: Pagination
  ) {
    merchants(
      product: $product
      amount: $amount
      service: $service
      area: $area
      pagination: $pagination
    ) {
      cursor
      hasMore
      records {
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
  }
`

export default NearbyMerchantsQuery
