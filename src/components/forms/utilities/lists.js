import axios from 'axios'
import { mark } from '../../../components/utility/performance'

export const getCoins = async ({ quote = 'USD', limit = 100 } = {}) => {
  const url = `https://min-api.cryptocompare.com/data/top/totalvolfull?limit=${limit}&tsym=${quote}&api_key=${process.env.REACT_APP_CRYPTOCOMPARE_API_KEY}`
  try {
    const response = await axios.get(url)
    if (response && response.data) {
      if (response.data.Response === 'Error') {
        console.warn('cryptocompare has an error:')
        console.warn(response.data.Message)
        return
      }
      const coins = response.data && response.data.Data
      if (coins) {
        return coins.map(coin => ({
          name: coin.CoinInfo.Name,
          value: coin.CoinInfo.Name,
          display: coin.CoinInfo.FullName,
          imageUrl: `https://www.cryptocompare.com${coin.CoinInfo.ImageUrl}`,
          detail: coin.DISPLAY ? coin.DISPLAY[quote].PRICE : '',
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

export const setCoins = async ({ quote = 'USD', updateList }) => {
  mark('setCoins started')
  const fetchedList = await getCoins({
    quote,
    limit: 100,
  })
  if (fetchedList) {
    mark('setCoins fetched')
    updateList({ name: 'coins', list: fetchedList, quote })
  }
}

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

export const setCurrencies = async ({ updateList }) => {
  mark('setCurrencies started')
  const fetchedList = await getCurrencies()
  mark('setCurrencies fetched')
  if (fetchedList) {
    updateList({ name: 'currencies', list: fetchedList })
  }
}

export const getCoinbaseProducts = async () => {
  const url = 'https://api.pro.coinbase.com/products'
  try {
    const response = await axios.get(url)
    if (response && response.data) {
      return response.data.map(item => item.id)
    } else {
      console.error('no response from Coinbase /products endpoint')
    }
  } catch (error) {
    console.error('Coinbase /products API error:', error)
  }
}

export const coinbaseProducts = [
  'BCH-USD',
  'BCH-BTC',
  'BTC-GBP',
  'BTC-EUR',
  'BCH-GBP',
  'MKR-USDC',
  'BCH-EUR',
  'BTC-USD',
  'ZEC-USDC',
  'DNT-USDC',
  'LOOM-USDC',
  'DAI-USDC',
  'GNT-USDC',
  'ZIL-USDC',
  'MANA-USDC',
  'CVC-USDC',
  'ETH-USDC',
  'ZRX-EUR',
  'BAT-USDC',
  'ETC-EUR',
  'BTC-USDC',
  'ZRX-USD',
  'ETH-BTC',
  'ETH-EUR',
  'ETH-USD',
  'LTC-BTC',
  'LTC-EUR',
  'LTC-USD',
  'ETC-USD',
  'ETC-BTC',
  'ZRX-BTC',
  'ETC-GBP',
  'ETH-GBP',
  'LTC-GBP',
]
