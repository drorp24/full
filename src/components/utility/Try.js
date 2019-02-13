import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import deburr from 'lodash/deburr'
import Autosuggest from 'react-autosuggest'
import match from 'autosuggest-highlight/match'
import parse from 'autosuggest-highlight/parse'
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import MenuItem from '@material-ui/core/MenuItem'
import { withStyles } from '@material-ui/core/styles'
import { cryptoCurrencies } from '../../queries/currencies'
import { produce } from 'immer'

const loadSuggestions = async ({ fetchList, setState }) => {
  const list = await fetchList()
  setState(
    produce(draft => {
      draft.list = list
    })
  )
}

function renderInputComponent(inputProps) {
  const { classes, inputRef = () => {}, ref, ...other } = inputProps

  return (
    <TextField
      fullWidth
      InputProps={{
        inputRef: node => {
          ref(node)
          inputRef(node)
        },
        classes: {
          input: classes.input,
        },
      }}
      {...other}
    />
  )
}

function renderSuggestion(suggestion, { query, isHighlighted }) {
  const matches = match(suggestion, query)
  const parts = parse(suggestion, matches)

  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {parts.map((part, index) =>
          part.highlight ? (
            <span key={String(index)} style={{ fontWeight: 500 }}>
              {part.text}
            </span>
          ) : (
            <strong key={String(index)} style={{ fontWeight: 300 }}>
              {part.text}
            </strong>
          )
        )}
      </div>
    </MenuItem>
  )
}

function getSuggestionValue(suggestion) {
  return suggestion
}

const styles = theme => ({
  root: {
    height: 250,
    flexGrow: 1,
  },
  container: {
    position: 'relative',
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
  divider: {
    height: theme.spacing.unit * 2,
  },
})

const IntegrationAutosuggest = ({ fetchList = cryptoCurrencies, classes }) => {
  const [state, setState] = useState({
    single: '',
    popper: '',
    suggestions: [],
    list: [],
  })

  useEffect(() => {
    loadSuggestions({ fetchList, setState })
  }, [])

  function getSuggestions(value) {
    const inputValue = deburr(value.trim()).toLowerCase()
    const inputLength = inputValue.length
    const suggestions = state.list

    let count = 0

    return inputLength === 0
      ? []
      : suggestions.filter(suggestion => {
          const keep =
            count < 5 &&
            suggestion.slice(0, inputLength).toLowerCase() === inputValue

          if (keep) {
            count += 1
          }

          return keep
        })
  }

  const handleSuggestionsFetchRequested = ({ value }) => {
    setState(
      produce(draft => {
        draft.suggestions = getSuggestions(value)
      })
    )
  }

  const handleSuggestionsClearRequested = () => {
    setState(
      produce(draft => {
        draft.suggestions = []
      })
    )
  }

  const handleChange = name => (event, { newValue }) => {
    setState(
      produce(draft => {
        draft[name] = newValue
      })
    )
  }

  const autosuggestProps = {
    renderInputComponent,
    suggestions: state.suggestions,
    onSuggestionsFetchRequested: handleSuggestionsFetchRequested,
    onSuggestionsClearRequested: handleSuggestionsClearRequested,
    getSuggestionValue,
    renderSuggestion,
  }

  return (
    <div className={classes.root}>
      <Autosuggest
        {...autosuggestProps}
        inputProps={{
          classes,
          placeholder: 'Select a crypto coin',
          value: state.single,
          onChange: handleChange('single'),
        }}
        theme={{
          container: classes.container,
          suggestionsContainerOpen: classes.suggestionsContainerOpen,
          suggestionsList: classes.suggestionsList,
          suggestion: classes.suggestion,
        }}
        renderSuggestionsContainer={options => (
          <Paper {...options.containerProps} square>
            {options.children}
          </Paper>
        )}
      />
    </div>
  )
}

IntegrationAutosuggest.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(IntegrationAutosuggest)
