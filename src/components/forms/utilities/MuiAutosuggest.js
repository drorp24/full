import React, { useState /* , useEffect */ } from 'react'
import deburr from 'lodash/deburr'
import Autosuggest from 'react-autosuggest'
import match from 'autosuggest-highlight/match'
import parse from 'autosuggest-highlight/parse'
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import MenuItem from '@material-ui/core/MenuItem'
import { makeStyles } from '@material-ui/styles'
import { produce } from 'immer'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'
import 'currency-flags/dist/currency-flags.min.css'
import InputAdornment from '@material-ui/core/InputAdornment'
import { arrayToObject } from '../../utility/shortcuts'
import moize from 'moize'
import { MyGrid } from '../../themed/Box'

moize.collectStats()

const FlagPure = ({ imageUrl, inlineImg, display }) => (
  <MyGrid container direction="column">
    {imageUrl ? (
      <MyGrid
        style={{ lineHeight: '0' }} // only way to vertically center LazyLoadImage
      >
        <LazyLoadImage
          effect="black-and-white"
          alt={display}
          height="25px"
          src={imageUrl}
        />
      </MyGrid>
    ) : (
      <div className={inlineImg} />
    )}
  </MyGrid>
)

const Flag = moize.react(FlagPure, { profileName: 'Flag' })

function renderInputComponentPure({
  value,
  classes,
  inputRef = () => {},
  ref,
  entireListObj,
  endAdornment = null,
  ...other
}) {
  const PassedEndAdornment =
    endAdornment && (() => <span>{endAdornment()}</span>)
  const EndAdornment = () =>
    endAdornment ? (
      <PassedEndAdornment />
    ) : (
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

// const renderInputComponent = moize(renderInputComponentPure, {
//   profileName: 'renderInputComponent',
//   equals(cacheKeyArgument, keyArgument) {
//     console.log('keyArgument: ', keyArgument)
//     console.log('cacheKeyArgument: ', cacheKeyArgument)

//     return cacheKeyArgument.name && cacheKeyArgument.name === keyArgument.name
//   },
// })

// For some obscure reason, every arrow move updates value twice:
// once for the actual selected value, another for ''
// This makes the entire chain from AutosuggestField to renderInputComponent render twice
// Unrelated, moize cache behaved really strangely
const renderInputComponent = renderInputComponentPure

function renderSuggestionPure(suggestion, { query, isHighlighted }) {
  const { name, display, imageUrl, inlineImg, detail } = suggestion
  const nameMatches = match(name, query)
  const nameParts = parse(name, nameMatches)
  const displayMatches = match(display, query)
  const displayParts = parse(display, displayMatches)

  const Parts = ({ parts }) => (
    <span>
      {parts.map((part, index) =>
        part.highlight ? (
          <span
            key={String(index)}
            style={{
              fontWeight: 500,
            }}
          >
            {part.text}
          </span>
        ) : (
          <strong
            key={String(index)}
            style={{
              fontWeight: 300,
            }}
          >
            {part.text}
          </strong>
        )
      )}
    </span>
  )

  // Flex's 'nowrap' aligns the right-hand 2 items to the right beautifully. It's not the 'space-around' that does that
  return (
    <MenuItem selected={isHighlighted} component="div">
      <MyGrid container justify="flex-start" wrap="nowrap">
        <MyGrid item style={{ maxWidth: '100%' }}>
          <Parts parts={nameParts} />
        </MyGrid>

        <MyGrid item width="70%" ml={1}>
          <Parts parts={displayParts} />
        </MyGrid>

        <MyGrid item mr={1} fs={0.75}>
          {detail}
        </MyGrid>

        <MyGrid item>
          <Flag {...{ imageUrl, inlineImg, display }} />
        </MyGrid>
      </MyGrid>
    </MenuItem>
  )
}

// moize'd renderSuggestion is called for the dropdown items only. After that, it's all cache hits.
const renderSuggestion = moize.react(renderSuggestionPure, {
  profileName: 'renderSuggestion',
})

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
  passedInputProps = {},
  label,
  quantity = 5,
  onChange,
  onBlur,
  value,
  endAdornment,
}) => {
  const [state, setState] = useState({
    single: '',
    suggestions: [],
    entireList: [],
  })

  // useEffect(() => {
  //   console.log('MuiAutosuggest moize.getStats():', moize.getStats())
  // })

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
        draft.single = value
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

  // For passedSuggestions, this is the only opportunity to update the value,
  // since they don't have an input component with an onChange function, only dropdown, whose changes this function listens to.
  const onSuggestionHighlighted = ({ suggestion }) => {
    if (passedSuggestions && suggestion && suggestion.name)
      onChange(suggestion.name)
  }

  // Autosuggest for some reason doesn't pass 'value' prop into 'renderInputComponent' so this hack fixes that
  const renderInputComponentWithTrueValue = trueValue => ({
    value: trueValue,
    classes,
    inputRef = () => {},
    ref,
    entireListObj,
    ...other
  }) =>
    renderInputComponent({
      value,
      classes,
      inputRef,
      ref,
      entireListObj,
      endAdornment,
      ...other,
    })

  const autosuggestProps = {
    renderInputComponent: renderInputComponentWithTrueValue(value),
    suggestions: state.suggestions,
    onSuggestionsFetchRequested: handleSuggestionsFetchRequested,
    onSuggestionsClearRequested: handleSuggestionsClearRequested,
    getSuggestionValue,
    renderSuggestion,
    onSuggestionHighlighted,
    focusInputOnSuggestionClick: false,
  }

  const entireListObj =
    entireList && entireList.length ? arrayToObject(entireList, 'name') : null

  const inputProps = {
    classes,
    label,
    value,
    onChange,
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
      renderSuggestionsContainer={options => (
        <Paper
          {...options.containerProps}
          square
          style={{ maxWidth: '100%', maxHeight: '40vh', overflow: 'auto' }}
        >
          {options.children}
        </Paper>
      )}
    />
  )
}

MuiAutosuggest.propTypes = {}

export default React.memo(MuiAutosuggest)
