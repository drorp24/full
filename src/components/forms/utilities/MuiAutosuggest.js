import React, { useState } from 'react'
import deburr from 'lodash/deburr'
import Autosuggest from 'react-autosuggest'
import match from 'autosuggest-highlight/match'
import parse from 'autosuggest-highlight/parse'
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import MenuItem from '@material-ui/core/MenuItem'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/styles'
import { produce } from 'immer'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'
import 'currency-flags/dist/currency-flags.min.css'

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
  const { name, display, imageUrl, inlineImg, detail } = suggestion
  const nameMatches = match(name, query)
  const nameParts = parse(name, nameMatches)
  const displayMatches = match(display, query)
  const displayParts = parse(display, displayMatches)
  return (
    <MenuItem selected={isHighlighted} component="div">
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="center"
      >
        <Grid item style={{ flexBasis: '80%' }}>
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="center"
          >
            <Grid item>
              <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="center"
              >
                <Grid item>
                  <Grid
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                  >
                    {imageUrl && (
                      <LazyLoadImage
                        effect="black-and-white"
                        alt={display}
                        height="30"
                        src={imageUrl}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justify: 'center',
                          alignItems: 'center',
                        }}
                      />
                    )}
                    {inlineImg && <div className={inlineImg} />}
                  </Grid>
                </Grid>
                <Grid item style={{ marginLeft: '0.75em' }}>
                  {displayParts.map((part, index) =>
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
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container direction="column" justify="center">
                <Grid item style={{ fontSize: '0.75em' }}>
                  {detail}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          {nameParts.map((part, index) =>
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
        </Grid>
      </Grid>
    </MenuItem>
  )
}

function getSuggestionValue(suggestion) {
  return suggestion.name
}

const useStyles = makeStyles(theme => ({
  root: {},
  container: {
    position: 'relative',
    width: '100%',
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
  input: {
    color: theme.palette.primary.main,
  },
}))

const MuiAutosuggest = ({
  entireList,
  label,
  quantity = 5,
  onChange,
  onBlur,
}) => {
  const [state, setState] = useState({
    single: '',
    suggestions: [],
    entireList: [],
  })

  const classes = useStyles()

  function getSuggestions(value) {
    const inputValue = deburr(value.trim()).toLowerCase()
    const inputLength = inputValue.length

    let count = 0

    return inputLength === 0 || !entireList
      ? []
      : entireList.filter(suggestion => {
          const keep =
            (count < quantity &&
              suggestion.name.slice(0, inputLength).toLowerCase() ===
                inputValue) ||
            (count < quantity &&
              suggestion.display.slice(0, inputLength).toLowerCase() ===
                inputValue)

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
    onChange(newValue)
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
    <Autosuggest
      {...autosuggestProps}
      inputProps={{
        classes,
        label,
        value: state.single,
        onChange: handleChange('single'),
        onBlur,
      }}
      theme={{
        container: classes.container,
        suggestionsContainerOpen: classes.suggestionsContainerOpen,
        suggestionsList: classes.suggestionsList,
        suggestion: classes.suggestion,
      }}
      renderSuggestionsContainer={options => (
        <Paper {...options.containerProps} square style={{ width: '100%' }}>
          {options.children}
        </Paper>
      )}
    />
  )
}

MuiAutosuggest.propTypes = {}

export default React.memo(MuiAutosuggest)
