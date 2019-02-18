import React from 'react'
import PlacesAutocomplete from // getLatLng, // geocodeByAddress,
'react-places-autocomplete'
import MuiAutosuggest from './MuiAutosuggest'

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
    window.state = this.state
    return (
      // Oddly, PlacesAutoComplete's 'value' and 'onChange' are passed directly to input and *not* to the render prop's props
      // Without these, MuiAutosuggest can't update the value when user selects on the dropdown (by mouse or arrows)
      // The context solves this.
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
          {({ getInputProps, suggestions }) => {
            const passedSuggestions = suggestions.map(suggestion => ({
              display: '',
              name: suggestion.description,
            }))
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
          }}
        </PlacesAutocomplete>
      </LocationContext.Provider>
    )
  }
}

export default LocationSearchInput
