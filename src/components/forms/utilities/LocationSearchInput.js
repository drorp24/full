import React /* , { useEffect } */ from 'react'
import PlacesAutocomplete from 'react-places-autocomplete'
import MuiAutosuggest from './MuiAutosuggest'
import moize from 'moize'

moize.collectStats()

const LocationContext = React.createContext()

class LocationSearchInput extends React.Component {
  constructor(props) {
    super(props)
    this.state = { address: props.value || '' }
  }

  handleChange = address => {
    if (address) {
      this.setState({ address })
      this.props.onChange(address)
    }
  }

  render() {
    return (
      // Oddly, PlacesAutoComplete's 'value' and 'onChange' are passed directly to input and *not* to the render prop's props
      // Context enables MuiAutosuggest to access onChange, thus updating the state according to user's selection
      <LocationContext.Provider
        value={{
          value: this.props.value,
          onChange: this.handleChange,
          endAdornment: this.props.endAdornment,
        }}
      >
        <PlacesAutocomplete
          value={this.state.address}
          onChange={this.handleChange}
          // PlacesAutocomplete triggers an onSelect only when browsing with arrows then hitting the enter key to select
          // It does not trigger it when mouse is used (even in desktop). Hopefully it should be okay in mobile,
          onSelect={this.props.updateAddress}
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
      {({ value, onChange, onSelect, endAdornment }) => (
        <MuiAutosuggest
          {...{
            passedSuggestions,
            passedInputProps: getInputProps(),
            value,
            onChange,
            onSelect,
            endAdornment,
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
