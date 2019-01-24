import { createMuiTheme } from '@material-ui/core/styles'

// Can't think of any other way to customize the theme based on its own values
const createdTheme = createMuiTheme()
const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  page: {
    padding: 40,
    height: '100vh',
  },
  form: {
    header: {
      height: '20%',
      border: '1px solid red',
      padding: createdTheme.spacing.unit * 2,
      textAlign: 'center',
      title: {
        typography: createdTheme.typography.h6,
      },
      subtitle: {
        typography: createdTheme.typography.body1Next,
        color: createdTheme.palette.grey[500],
      },
    },
    body: {
      height: '70%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-evenly',
      border: '1px solid brown',
    },
    footer: {
      height: '10%',
      border: '1px solid green',
    },
  },
})

window.theme = theme
export default theme
