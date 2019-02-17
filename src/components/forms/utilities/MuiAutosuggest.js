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
import InputAdornment from '@material-ui/core/InputAdornment'
import { arrayToObject } from '../../utility/shortcuts'

const Flag = ({ imageUrl, inlineImg, display }) => (
  <>
    {imageUrl && (
      <Grid container direction="column" justify="center" alignItems="center">
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
            marginBottom: '7px',
            width: '24px',
            height: '24px',
          }}
        />
      </Grid>
    )}
    {inlineImg && <div className={inlineImg} />}
  </>
)

function renderInputComponent({
  value,
  classes,
  inputRef = () => {},
  ref,
  entireListObj,
  ...other
}) {
  console.log('>>  renderInputComponent. value: ', value)
  const EndAdornment = () => (
    <InputAdornment position="end">
      <>
        {value && entireListObj && entireListObj[value] && (
          <Flag {...entireListObj[value]} />
        )}
      </>
    </InputAdornment>
  )

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
        endAdornment: EndAdornment(),
      }}
      value={value}
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

  console.log('renderSuggestion. sugestion:', suggestion)

  const Parts = ({ parts }) => {
    return parts.map((part, index) =>
      part.highlight ? (
        <span key={String(index)} style={{ fontWeight: 500 }}>
          {part.text}
        </span>
      ) : (
        <strong key={String(index)} style={{ fontWeight: 300 }}>
          {part.text}
        </strong>
      )
    )
  }

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
                    <Flag {...{ imageUrl, inlineImg, display }} />
                  </Grid>
                </Grid>
                <Grid item style={{ marginLeft: '0.75em' }}>
                  <Parts parts={displayParts} />
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
          <Parts parts={nameParts} />
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
  passedSuggestions,
  label,
  quantity = 5,
  passedOnChange,
  onChange, // TODO: Obvious
  onBlur,
  passedInputProps = {},
  passedOnSelect,
  value,
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
        draft.suggestions = passedSuggestions
          ? passedSuggestions
          : getSuggestions(value)
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

  // TODO: Remove?? the single state is passed from parent
  const handleChange = name => (event, { newValue }) => {
    setState(
      produce(draft => {
        draft[name] = newValue
      })
    )
    if (onChange) onChange(newValue)
  }

  const onSuggestionHighlighted = props => {
    if (!props || !props.suggestion) return
    const {
      suggestion: { name },
    } = props
    if (!name) return
    console.log('>>>>>>>>>   onSuggestionHighlighted. suggestion.name:', name)
    // setState(
    //   produce(draft => {
    //     draft.single = name
    //   })
    // )
    if (passedOnChange) passedOnChange(name) // TODO: Obvious
    // renderInputComponent({ value: name, classes })
  }

  // Never triggered; onSuggestionHighlighted cacthes clicks too
  const onSuggestionSelected = props => {
    if (!props || !props.suggestion) return
    console.log(
      '00000000000000000000000000000000   onSuggestionSelected. props:',
      props
    )
    const {
      suggestion: { name },
    } = props
    if (passedOnSelect) passedOnSelect({ address: name })
  }

  const autosuggestProps = {
    renderInputComponent,
    suggestions: state.suggestions,
    onSuggestionsFetchRequested: handleSuggestionsFetchRequested,
    onSuggestionsClearRequested: handleSuggestionsClearRequested,
    getSuggestionValue,
    renderSuggestion,
    onSuggestionHighlighted,
    onSuggestionSelected,
  }

  // const value = state.single
  // console.log('state.single: ', state.single)

  const entireListObj =
    entireList && entireList.length ? arrayToObject(entireList, 'name') : null

  const inputProps = {
    classes,
    label,
    value,
    onChange: handleChange('single'),
    onBlur,
    entireListObj,
    ...passedInputProps,
  }

  return (
    <Autosuggest
      {...autosuggestProps}
      inputProps={inputProps}
      theme={{
        container: classes.container,
        suggestionsContainerOpen: classes.suggestionsContainerOpen,
        suggestionsList: classes.suggestionsList,
        suggestion: classes.suggestion,
      }}
      renderSuggestionsContainer={options => {
        // console.log(
        //   'options.children[0]: ',
        //   options.children && options.children[0] && options.children[0]
        // )
        // console.log(
        //   'options.children[1]: ',
        //   options.children && options.children[1] && options.children[1]
        // )
        // console.log(
        //   'options.children[2]: ',
        //   options.children && options.children[2] && options.children[2]
        // )
        return (
          <Paper {...options.containerProps} square style={{ width: '100%' }}>
            {options.children}
          </Paper>
        )
      }}
    />
  )
}

MuiAutosuggest.propTypes = {}

export default React.memo(MuiAutosuggest)
