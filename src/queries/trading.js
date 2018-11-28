import { gql } from 'apollo-boost'

export default gql`
  query {
    trading(coins: ["BTC", "ETC"], currencies: ["USD", "EUR"]) {
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
