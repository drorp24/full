import React /* , { useEffect } */ from 'react'
import PlacesAutocomplete from 'react-places-autocomplete' // getLatLng, // geocodeByAddress,
import MuiAutosuggest from './MuiAutosuggest'
import moize from 'moize'

moize.collectStats()

const LocationContext = React.createContext()

class LocationSearchInput extends React.Component {
  constructor(props) {
    super(props)
    this.state = { address: '' }
  }

  handleChange = address => {
    if (address) {
      this.setState({ address })
      // geocodeByAddress(address)
      //   .then(results => getLatLng(results[0]))
      //   .then(latLng => console.log('Success', latLng))
      //   .catch(error => console.error('Error', error))
    }
  }

  render() {
    return (
      // Oddly, PlacesAutoComplete's 'value' and 'onChange' are passed directly to input and *not* to the render prop's props
      // Context enables MuiAutosuggest to access onChange, thus updating the state according to user's selection
      <LocationContext.Provider
        value={{
          onChange: this.handleChange,
        }}
      >
        <PlacesAutocomplete
          value={this.state.address}
          onChange={this.handleChange}
          onSelect={this.handleSelect}
        >
          {({ getInputProps, suggestions }) => (
            <LocationAutoSuggest
              {...{
                getInputProps,
                suggestions,
              }}
            />
          )}
        </PlacesAutocomplete>
      </LocationContext.Provider>
    )
  }
}

const LocationAutoSuggestPure = ({ getInputProps, suggestions }) => {
  const passedSuggestions = suggestions.map(suggestion => ({
    display: '',
    name: suggestion.description,
  }))

  // useEffect(() => {
  //   console.log('moize.getStats():', moize.getStats())
  // })

  return (
    <LocationContext.Consumer>
      {({ onChange }) => (
        <MuiAutosuggest
          {...{
            passedSuggestions,
            passedInputProps: getInputProps(),
            onChange,
          }}
        />
      )}
    </LocationContext.Consumer>
  )
}

// When called from Try, MuiAutosuggest was entered 4 times per each arrow move
// this moize'ation reduced it to 2 times, and moize.getStats() showed 70% were fetched from cache (?)
// Other React.memo / moize weren't helping much.
const LocationAutoSuggest = moize.react(LocationAutoSuggestPure, {
  profileName: 'locationAutoSuggest',
})

export default React.memo(LocationSearchInput)
