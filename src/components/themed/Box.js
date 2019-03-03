// The "3rd generation" evolution of CSS-in-JS enables using props that "hook themselves" into the proper keys in theme
// *without* having to define theme-based styles upfront and refer to them the component instance as "classes"
// This saves the need to define such upfront styles *wherever* such component is used!
// Instead, its newly define props know which key in theme to pick their values from.
// This concept was popularized by 'styled-system' and adopted by MUI in its new 'system' package used here.
//
// There are two ways to implement this concept in the current alpha version:
// Define a new prop for <Box /> (or any other existing component) that refers to a particular (existing or new) key in 'theme'
// Define a prop (e.g., 'formVariant') that points at an entire object at 'theme'. Typically called 'variant'.
// This latter method has a number of *big* advantages, and will hence be my go-to solution going forward:
// - No need to define a prop for every css proerty. The variant will pick-up every definition in the object (like class)
// - With a single property for an entire category (e.g., 'formVariant') I can use generic <Box /> rather than defining a new styled component (e.g., Page)
// - Using <Box /> enables using its many existing roperties (e.g., 'textAlign')
//   Using <Box /> props is good for cases where I want to customize the variant in one special case (like Buttons have variant and custom props too)
//   Otherwise, variant can and should encompass all definitions pertaining to that variant.
import { styled } from '@material-ui/styles'
import {
  compose,
  style,
  spacing,
  palette,
  typography,
} from '@material-ui/system'
import Typography from '@material-ui/core/Typography'
import React from 'react'
import Grid from '@material-ui/core/Grid'

// This is one way to do this: configure new props
// With each prop corresponding to one definition in the theme object
// It will enable wrapping any object in <Box /> with the Box properties corresponding to theme variables
// without the need to define a theme => based style upfront and then use 'classes' in the component
const pgpadding = style({
  prop: 'pgpadding',
  cssProperty: 'padding',
  themeKey: 'page',
})

const pgheight = style({
  prop: 'pgheight',
  cssProperty: 'height',
  themeKey: 'page',
})

export const page = compose(
  pgpadding,
  pgheight
)

// And that's the variant way of doing it:
// Instead of defining new props one for each css property in the theme,
// Define one prop to refer to an entire object* in the theme (attributed by cssProperty: false)
// This enables adding more definitions to that theme key w/o having to define a new prop for each one
// Function enables me to quickly add another variant for another (entire) key of the theme
// * it must point to an obj rather than a single property to work
export const variant = key =>
  style({
    prop: `${key}Variant`,
    cssProperty: false,
    themeKey: key,
  })

// themeKey seems to be mandatory at that stage at least
// so can't create a cross-theme 'color' prop but have to define one per each theme key
const color = key =>
  style({
    prop: `${key}Color`,
    cssProperty: 'color',
    themeKey: key,
  })

export const form = compose(
  variant('form'),
  color('form')
)

// If there are named exports in a file, it's better to not have any default export
// Reason: If I wrongly assume one of those imports is the default one, I will be silently given the default one
export const Box = styled('div')(
  compose(
    spacing,
    palette,
    typography,
    variant('page'),
    form
  )
)

Box.displayName = 'Box'

// And here I'm adding the same props I've defined for <Box /> (formVariant & formColor)
// to an existing, externally imported component like <Typography />
// That allows me to add to <Typography/> definitions from the theme's 'form' key (that I introduced to theme)
// using the new props to indicate the theme's path from 'form' that holds the value
export const MyTypography = styled(Typography)(form)
MyTypography.displayName = 'MyTypography'

const Arrange = ({ children, direction, ...other }) => (
  <Grid
    container
    direction={direction}
    justify="space-between"
    alignItems="center"
    {...other}
  >
    {children}
  </Grid>
)

export const Column = ({ children, ...other }) => (
  <Arrange direction="column" {...{ children, ...other }} />
)
export const Row = ({ children, ...other }) => (
  <Arrange direction="row" {...{ children, ...other }} />
)

export const MyGrid = ({
  container,
  item,
  direction,
  justify,
  alignItems,
  width,
  ml,
  mr,
  fs,
  ...other
}) => {
  const dir = container ? { direction: direction || 'row' } : {}
  const just = container ? { justify: justify || 'center' } : {}
  const align = container ? { alignItems: alignItems || 'center' } : {}
  const style = {
    ...(item &&
      width && {
        flexBasis: width,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }),
    ...(ml && { marginLeft: `${ml}em` }),
    ...(mr && { marginRight: `${mr}em` }),
    ...(fs && { fontSize: `${fs}em` }),
  }

  return (
    <Grid
      {...{ container, ...dir, ...just, ...align, ...{ style }, ...other }}
    />
  )
}
