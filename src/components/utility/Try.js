import React from 'react'
import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider, makeStyles } from '@material-ui/styles'
import Button from '@material-ui/core/Button'

const theme = createMuiTheme({
  palette: {
    primary: { main: '#000' },
    secondary: { main: '#111' },
  },
})

const useStyles = makeStyles(theme => {
  console.log('theme primary color:', theme.palette.primary.main)
  console.log('theme secondary color:', theme.palette.secondary.main)
})

const MyButton = props => {
  useStyles()
  console.log('MyButton props: ', props)
  return <Button {...props} />
}

const Try = () => (
  <ThemeProvider theme={theme}>
    <MyButton color="primary">Primary</MyButton>
    <MyButton color="secondary">Secondary</MyButton>
  </ThemeProvider>
)

export default Try
