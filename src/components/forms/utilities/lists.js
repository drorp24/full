import capitalize from '../../utility/capitalize'
import axios from 'axios'
import { produce } from 'immer'
import { mark } from '../../utility/performance'

export const getCoins = async ({ currency = 'USD', limit = 100 } = {}) => {
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
          detail: coin.DISPLAY ? coin.DISPLAY[currency].PRICE : '',
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

export const setCoins = async ({ state, setState }) => {
  mark('setCoins started')
  const fetchedList = await getCoins({
    currency: state && state.values ? state.values.payCurrency : 'USD',
  })
  if (fetchedList) {
    mark('setCoins fetched')
    setState(
      produce(draft => {
        draft.coins = fetchedList
      })
    )
  }
}

// Each set<x> function must be global for lists to be configured dynamically
window.setCoins = setCoins

export const getCurrencies = async () => {
  const url = `https://openexchangerates.org/api/currencies.json
?app_id=${process.env.REACT_APP_OXR_APP_ID}`
  try {
    const response = await axios.get(url)
    if (response && response.data) {
      return Object.entries(response.data).map(([key, value]) => ({
        name: key,
        display: value,
        inlineImg: `currency-flag currency-flag-${key.toLowerCase()}`,
      }))
    } else {
      console.error('no response from OXR')
    }
  } catch (error) {
    console.error('OXR error:', error)
  }
}

export const setCurrencies = async ({ setState }) => {
  mark('setCurrencies started')
  const fetchedList = await getCurrencies()
  mark('setCurrencies fetched')
  if (fetchedList) {
    setState(
      produce(draft => {
        draft.currencies = fetchedList
      })
    )
  }
}

// Each set<x> function must be global for lists to be configured dynamically
window.setCurrencies = setCurrencies

export const getList = ({ list, state }) => (list && state[list]) || null

export const setList = async ({ list, state, setState }) => {
  console.log('setList called for list ' + list)
  return window[`set${capitalize(list)}`]({ state, setState })
}
