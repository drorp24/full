import capitalize from '../../utility/capitalize'
import axios from 'axios'
import { produce } from 'immer'

export const getCoins = async ({ currency = 'USD', limit = 30 } = {}) => {
  const url = `https://min-api.cryptocompare.com/data/top/totalvolfull?limit=${limit}&tsym=${currency}&api_key=${
    process.env.REACT_APP_CRYPTOCOMPARE_API_KEY
  }`
  try {
    const response = await axios.get(url)
    if (response && response.data) {
      if (response.data.Response === 'Error') {
        console.warn('cryptocompare has an error:')
        console.warn(response.data.Message)
        console.warn('response.data.RateLimit: ', response.data.RateLimit)
        return
      }
      const coins = response.data && response.data.Data
      if (coins) {
        return coins.map(coin => ({
          name: coin.CoinInfo.Name,
          value: coin.CoinInfo.Name,
          display: coin.CoinInfo.FullName,
          imageUrl: `http://www.cryptocompare.com${coin.CoinInfo.ImageUrl}`,
          detail: coin.DISPLAY[currency].PRICE,
        }))
      } else {
        console.warn('cryptocompare responded with only: ', response)
      }
    } else {
      console.warn('No response from cryptocompare')
    }
  } catch (error) {
    console.error(error)
  }
}

// Every get<x> function must be global for lists to be configured dynamically
window.getCoins = getCoins

export const getList = ({ list, state }) => (list && state[list]) || null

export const setList = async ({ list, setState }) => {
  const fetchedList = await window[`get${capitalize(list)}`]()
  setState(
    produce(draft => {
      draft[list] = fetchedList
    })
  )
}
