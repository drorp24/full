import capitalize from '../../src/components/utility/capitalize'
import axios from 'axios'

// TODO: Retrieve from server using gql
const currencies = [
  {
    value: 'USD',
    label: 'USD',
  },
  {
    value: 'EUR',
    label: 'EUR',
  },
  {
    value: 'BTC',
    label: 'BTC',
  },
  {
    value: 'JPY',
    label: 'JPY',
  },
  {
    value: 'ILS',
    label: 'ILS',
  },
]

const mdiIcons = [
  'BDT',
  'BRL',
  'BTC',
  'CHF',
  'CNY',
  'ETH',
  'EUR',
  'GBP',
  'ILS',
  'INR',
  'JPY',
  'KRW',
  'KZT',
  'NGN',
  'PHP',
  'RUB',
  'TRY',
  'TWD',
  'USD',
]

export const currencySymbol = ({ values: { currency } }) =>
  !!currency &&
  mdiIcons.includes(currency) &&
  `Currency${capitalize(currency.toLowerCase())}`

export const getCurrencySymbol = ({ values: { getCurrency } }) =>
  !!getCurrency &&
  mdiIcons.includes(getCurrency) &&
  `Currency${capitalize(getCurrency.toLowerCase())}`

export const getCurrencyOptions = ({ values: { payCurrency } }) =>
  currencies.filter(currency => currency.value !== payCurrency)

export const payCurrencyOptions = ({ values: { getCurrency } }) =>
  currencies.filter(currency => currency.value !== getCurrency)

export const cryptoCurrencies = async ({
  currency = 'USD',
  limit = 30,
} = {}) => {
  const url = `https://min-api.cryptocompare.com/data/top/totalvolfull?limit=${limit}&tsym=${currency}&api_key=${
    process.env.REACT_APP_CRYPTOCOMPARE_API_KEY
  }`
  try {
    const response = await axios.get(url)
    const coins = response.data.Data
    return coins.map(coin => ({
      name: coin.CoinInfo.Name,
      value: coin.CoinInfo.Name,
      display: coin.CoinInfo.FullName,
      imageUrl: `http://www.cryptocompare.com${coin.CoinInfo.ImageUrl}`,
      detail: coin.DISPLAY[currency].PRICE,
    }))
  } catch (error) {
    console.error(error)
  }
}
