import React, { useState } from 'react'
import { useSelector } from 'react-redux'
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
import IsolatedScroll from 'react-isolated-scroll'

moize.collectStats()

const FlagPure = ({ imageUrl, inlineImg, display }) => {
  const { online } = useSelector(store => store.device)
  return (
    <MyGrid container direction="column">
      {imageUrl ? (
        <MyGrid
          container
          style={{ lineHeight: '0' }} // only way to vertically center LazyLoadImage
          justify="flex-end"
        >
          {online && (
            <LazyLoadImage
              effect="black-and-white"
              alt={display}
              height="25px"
              src={imageUrl}
            />
          )}
        </MyGrid>
      ) : (
        <div className={inlineImg} />
      )}
    </MyGrid>
  )
}

const Flag = moize.react(FlagPure, { profileName: 'Flag' })

function renderInputComponentPure({
  value,
  classes,
  inputRef = () => {},
  ref,
  entireListObj,
  endAdornment = null,
  name,
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

  const setZ = e => {
    const other = name === 'quote' ? 'base' : 'quote'
    const el = document.getElementById(`${name}-helper-text`)
    const otherEl = document.getElementById(`${other}-helper-text`)
    const elParent = el && el.parentElement
    const otherElParent = otherEl && otherEl.parentElement
    if (elParent) elParent.style.zIndex = 1
    if (otherElParent) otherElParent.style.zIndex = 0
  }

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
        disableUnderline: true,
      }}
      onClick={setZ}
      value={
        value && entireListObj && entireListObj[value]
          ? entireListObj[value].display
          : value
      }
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
    <span style={{ marginRight: '1em' }}>
      {parts.map((part, index) =>
        part.highlight ? (
          <span
            key={String(index)}
            style={{
              fontWeight: 500,
              color: 'red',
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

  // TODO: This calls for CSS Grid
  return (
    <MenuItem
      selected={isHighlighted}
      component="div"
      style={{ fontSize: '0.9rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}
    >
      <MyGrid container justify="space-between" wrap="nowrap">
        <MyGrid
          item
          width={detail ? '60%' : imageUrl || inlineImg ? '90%' : '100%'}
        >
          <MyGrid container justify="flex-start">
            <MyGrid item width={detail ? '3.6em' : '100%'}>
              <Parts parts={nameParts} />
            </MyGrid>
            <MyGrid>
              <Parts parts={displayParts} />
            </MyGrid>
          </MyGrid>
        </MyGrid>

        <MyGrid
          item
          width={detail ? '30%' : '0%'}
          mr={detail ? 1 : 0}
          fs={0.75}
        >
          {detail}
        </MyGrid>

        <MyGrid
          item
          width={imageUrl || inlineImg ? '10%' : '0%'}
          overflow={imageUrl || inlineImg ? 'visible' : 'hidden'}
        >
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
    zIndex: 3,
    marginTop: theme.spacing(3),
    left: 0,
    right: 0,
    width: 'calc(100vw - 2em)',
  },
  suggestionsContainer: {
    maxWidth: '100%',
    maxHeight: '60vh',
    overflow: 'auto',
    backgroundColor: theme.palette.background.selectBox,
    borderRadius: '4px',
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
    height: theme.form.body.fields.input.height,
    padding: theme.form.body.fields.input.padding,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
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
  name,
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
  const renderInputComponentWithTrueValue = (trueValue, name) => ({
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
      name,
      ...other,
    })

  const renderSuggestionsContainer = ({ containerProps, children }) => {
    const { ref, ...restContainerProps } = containerProps
    const callRef = isolatedScroll => {
      if (isolatedScroll !== null) {
        ref(isolatedScroll.component)
      }
    }

    return (
      <IsolatedScroll ref={callRef} {...restContainerProps}>
        <Paper
          square
          elevation={5}
          {...containerProps}
          className={classes.suggestionsContainer}
        >
          {children}
        </Paper>
      </IsolatedScroll>
    )
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

  const {
    container,
    suggestionsContainerOpen,
    suggestionsList,
    suggestion,
  } = classes

  const theme = {
    container,
    suggestionsContainerOpen,
    suggestionsList,
    suggestion,
  }

  const autosuggestProps = {
    renderInputComponent: renderInputComponentWithTrueValue(value, name),
    suggestions: state.suggestions,
    onSuggestionsFetchRequested: handleSuggestionsFetchRequested,
    onSuggestionsClearRequested: handleSuggestionsClearRequested,
    getSuggestionValue,
    renderSuggestion,
    onSuggestionHighlighted,
    focusInputOnSuggestionClick: false,
    renderSuggestionsContainer,
    inputProps,
    theme,
  }

  return <Autosuggest {...autosuggestProps} />
}

MuiAutosuggest.propTypes = {}

export default React.memo(MuiAutosuggest)
