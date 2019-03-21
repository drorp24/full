const mapStateToSearch = (state, setSearch) => {
  const {
    base,
    quote,
    amount,
    delivery,
    location: { lat, lng },
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
    results: {
      count: 10,
    },
  }

  setSearch(search)
}

export default mapStateToSearch
