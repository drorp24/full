import { gql } from 'apollo-boost'

export default gql`
  subscription {
    tradingUpdated {
      time
      trading {
        coin
        prices {
          currency
          price
        }
      }
    }
  }
`
