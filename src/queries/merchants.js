import { gql } from 'apollo-boost'

export default gql`
  query {
    merchants(
      searchArea: { lat: 32.05, lng: 34.77, distance: 50 }
      merchantServices: { currency: "CHF", delivery: true }
      searchResults: { results: 3 }
    ) {
      name
      address
      name_he
      delivery
      phone
    }
  }
`
