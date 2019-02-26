import { createMuiTheme } from '@material-ui/core/styles'

// Can't think of any other way to customize the theme based on its own values
// TODO: Surely I can just spread merge them rather than calling createMuiTheme twice
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
      padding: '0 2.5rem',
    },
  },
  form: {
    root: {
      width: '100%',
    },
    header: {
      height: '20%',
      padding: createdTheme.spacing.unit * 2,
      textAlign: 'center',
      title: {
        typography: { ...createdTheme.typography.h6, ...{ fontSize: '5vmin' } },
      },
      subtitle: {
        typography: {
          ...createdTheme.typography.body1,
          ...{ fontSize: '4vmin', fontWeight: 300, color: '#333' },
        },
      },
    },
    body: {
      height: '70%',
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
      height: '10%',
    },
  },
})

console.log('theme', theme)

// console.log('theme', theme)
export default theme
