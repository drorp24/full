import capitalize from '../../src/components/utility/capitalize'

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
