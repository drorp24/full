const mapStateToSearch = (state, setSearch) => {
  const {
    base,
    quote,
    amount,
    delivery,
    location: { lat = 32.0853, lng = 34.781769 },
    lookaround,
  } = state.values

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
      count: 2,
    },
  }

  setSearch(search)
}

export default mapStateToSearch
