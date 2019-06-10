import { gql } from 'apollo-boost'

export const mapFormToMerchantQueryVariables = form => {
  const {
    base,
    quote,
    amount,
    delivery,
    location: { lat = 32.0853, lng = 34.781769 },
    lookaround,
  } = form.values

  const search = {
    product: {
      base,
      quote,
    },
    amount,
    service: {
      delivery,
    },
    area: {
      lat,
      lng,
      distance: lookaround ? 5 : 50,
    },
    pagination: {
      sortKey: '_id',
      sortOrder: 'ascending',
      after: '',
      count: 8,
    },
  }

  return search
}

const merchantsQuery = gql`
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

export default merchantsQuery
