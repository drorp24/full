// My own implementation of Box, enriched with custom properties, using MUI's alpha 'styled-system' inspired 'system'.
// The "3rd generation" evolution of CSS-in-JS allows using props that hook into the theme
// requireing no theme-based styles functiontions to define at all, let alone for each and every component again.
// Instead, properties and their theme source are defined in a place like this, saving me from defining it ever again (DRY)
// This allowed me to define <Page>, a special case of <Box>, w/o having to specify hard-coded values
// *and* w/o ever having to define anything that requires these page theme values in any future component too.
import { styled } from '@material-ui/styles'
import { compose, spacing, palette, style } from '@material-ui/system'

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

const Box = styled('div')(
  compose(
    spacing,
    palette,
    page
  )
)

export default Box
