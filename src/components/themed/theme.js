import { createMuiTheme } from '@material-ui/core/styles'
import purple from '@material-ui/core/colors/purple'
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
    primary: purple, // any of Mui's set colors (purple in this case) is an entire obj with 'main', 'light', 'dark', 'contrastText' and [x] shade keys
    secondary: green,
  },
  page: {
    container: {
      height: '100vh',
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
    },
  },
  form: {
    root: {
      width: '100%',
      height: '100%',
    },
    header: {
      height: '15%',
      background: '#888', //temporary
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: createdTheme.spacing(2),
      textAlign: 'center',
      title: {
        typography: {
          fontSize: '8vmin',
          color: '#fff',
          fontWeight: '300',
        },
      },
      subtitle: {
        typography: {
          fontSize: '8vmin',
          fontWeight: 300,
          color: '#fff',
        },
      },
    },
    body: {
      height: '70%',
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
      height: '15%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
  },
})

console.log('theme', theme)

export default theme
