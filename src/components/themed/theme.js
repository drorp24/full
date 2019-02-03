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
        typography: { ...createdTheme.typography.h6, ...{ fontSize: '5vw' } },
      },
      subtitle: {
        typography: {
          ...createdTheme.typography.body1,
          ...{ fontSize: '4vw', fontWeight: 300, color: '#333' },
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
        disabled: createdTheme.palette.action.disabled,
      },
    },
    footer: {
      height: '10%',
    },
  },
})

console.log('theme', theme)
export default theme
