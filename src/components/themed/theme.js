import { createMuiTheme } from '@material-ui/core/styles'

// Can't think of any other way to customize the theme based on its own values
const createdTheme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
})
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
      padding: createdTheme.spacing.unit * 2,
      textAlign: 'center',
      title: {
        typography: createdTheme.typography.h6,
      },
      subtitle: {
        typography: createdTheme.typography.body1,
        color: createdTheme.palette.grey[500],
      },
    },
    body: {
      height: '70%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-evenly',
      fields: {
        disabled: createdTheme.palette.action.disabled,
      },
    },
    footer: {
      height: '10%',
    },
  },
})

export default theme
