import { createMuiTheme } from '@material-ui/core/styles'

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  page: {
    padding: 40,
    height: '100vh',
  },
})

export default theme
