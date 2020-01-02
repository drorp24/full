import { createMuiTheme } from '@material-ui/core/styles'
import green from '@material-ui/core/colors/green'

// Can't think of any other way to customize the theme based on its own values
// TODO: Surely I can just spread merge them rather than calling createMuiTheme twice
// Anyway, the first one is for overrides (e.g., replacing primary color)
// the second one is for additions
const createdTheme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
})
const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    primary: {
      main: '#6200f2',
      contextual: '#000',
    },
    secondary: green,
  },
  page: {
    content: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      width: '100%',
      height: '100%',
    },
  },
  form: {
    header: {
      padding: createdTheme.spacing(2),
      textAlign: 'center',
      color: createdTheme.palette.action.active,
      border: '2px solid blue',
    },
    body: {
      border: '2px solid orange',

      padding: '2.5rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-evenly',
      color: createdTheme.palette.text.secondary,
      fields: {
        label: {
          color: createdTheme.palette.action.active,
          fontSize: '0.9em',
          unchecked: {
            color: createdTheme.palette.action.disabled,
          },
        },
      },
    },
    footer: {
      border: '2px solid darkgreen',

      padding: '2.5rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    typography: {
      header: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
      },
      title: {
        height: '50%',
        fontSize: '6vmin',
        color: '#000000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      },
      subtitle: {
        fontSize: '4.5vmin',
        color: createdTheme.palette.text.secondary,
        whiteSpace: 'pre-line',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      },
    },
  },
})

// window.theme = theme

export default theme
