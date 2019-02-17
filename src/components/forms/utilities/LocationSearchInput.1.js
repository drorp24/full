import React from 'react'
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete'
import MuiAutosuggest from './MuiAutosuggest'

const LocationContext = React.createContext()

class LocationSearchInput extends React.Component {
  constructor(props) {
    super(props)
    this.state = { address: '' }
  }

  handleChange = address => {
    if (address) this.setState({ address })
  }

  // Never triggered
  handleSelect = ({ address }) => {
    console.log('HANDLESELECT TRIGGERED!!')
    this.setState({ address })
    geocodeByAddress(address)
      .then(results => getLatLng(results[0]))
      .then(latLng => console.log('Success', latLng))
      .catch(error => console.error('Error', error))
  }

  render() {
    window.state = this.state
    return (
      // Context is required since PlacesAutoComplete doesn't pass its state onto the render function
      <LocationContext.Provider
        value={{
          passedOnChange: this.handleChange,
          passedOnSelect: this.handleSelect,
          passedValue: this.state.address,
        }}
      >
        <PlacesAutocomplete
          value={this.state.address}
          onChange={this.handleChange}
          onSelect={this.handleSelect}
        >
          {({ getInputProps, suggestions }) => {
            const passedSuggestions = suggestions.map(suggestion => ({
              display: '',
              name: suggestion.description,
            }))
            return (
              <LocationContext.Consumer>
                {({ passedOnChange, passedOnSelect, passedValue }) => (
                  <MuiAutosuggest
                    {...{
                      passedSuggestions,
                      passedInputProps: getInputProps(),
                      passedOnChange,
                      passedOnSelect,
                      passedValue,
                    }}
                  />
                )}
              </LocationContext.Consumer>
            )
          }}
        </PlacesAutocomplete>
      </LocationContext.Provider>
    )
  }
}

export default LocationSearchInput
