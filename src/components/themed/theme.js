import { createMuiTheme } from '@material-ui/core/styles'
import green from '@material-ui/core/colors/green'
import blue from '@material-ui/core/colors/blue'
import orange from '@material-ui/core/colors/orange'

// ! MUI's 'light' and 'dark' keys doesn't seem to have anything to do with light/dark mode
// Importing a color from MUI (as I did with 'blue') brings an object with 'light' and 'dark' keys which are each offset from the 'main' key
// which represents the main color. I don't know what MUI does with these variations, but from my experience,
// it has nothing to do with 'light' or 'dark' mode: when I changed theme.palette.type from 'light' to 'dark' and vice versa
// MUI changed a lot of other values, but not the primary color; it got the same 'main' color in either mode.
//
// ! Customizing MUI's default theme requires calling createMuiTheme twice
// It needs no explaining why I want to refer to the MUI default theme values when applicable rather than hard-code them.
// Yet except for one stackoverflow post, I didn't find anyone discussing what seems to require calling createMuiTheme twice
// Anyway, the answer to the single stackoverflow post was to do exactly what I did: call createMuyTheme twice.
//
// * The 1st call should be the one dealng with the mode
// Only then can I use variables such as theme.palette.primary.main, knowing that that main color is already set according to the mode
// There's no other way to not hard-code the color. I wonder if I'm missing anything because there was no discussion about the double call.
//
// * theme consumer should useMemo
// Since theme calulcation is a complex function (let alone called twice) on the one hand,
// and since it can be toggle many times back and forth on the other hand,
// (and since it is a pure function, dependent on 2 discrete values)
// caller of theme should useMemo, which would save the results of each of these 2 values.
//
// ! Use MUI's designated theme keys and refrain from unnecessary custom rules
// Using MUI's theme keys rather than hard-code values is not enough;
// When I used the 'active' theme color for form labels for instance, it didn't change when mode was changed to 'dark'.
// That leads me to the first rule which is:
// - Use the proper key designated by MUI for that use case, not just any theme key;
// But when I looked for the right key designated by MUI for form label colors I didn't find any.
// MUI just picks the regular/primary color for many elements such as form labels and others w/o specifying rules for them.
// This makes absolute sense to me and leads to the 2nd rule which is even more important
// - Unless absolutely required, do not apply any custom rules and let MUI decide how to style the element
// I was overriding a lot of colors but then they didn't change back when the mode was changed from 'light' to 'dark' and vice versa.
// Once I removed my rules, MUI styled those elements well; in fact it probably better adhered to the theme than what I did;
// more importantly, it also replaced the colors according to the mode once i removed my own rules.
//
// ! Refrain from over-using 'system' variants like 'formVariant' and 'pageVariant'
// When I read about MUI's design system and variants I initially played with it myself,
// creating some components like <Box /> and <MyTypography />
// with their very own 'variants' like 'formVariants' and 'pageVariants';
// Later I understood that this is actually a very bad idea.
//
// What this does is to put the styling away in a remote file again ('theme.js' in this case)
// rather than include them in the same file as the component they style, which is one of css-in-js benefits, that is more in line with
// concepts such as componentization and shadow-dom.
// Worse yet, it polutes the 'theme' with component-specific styling rules rather
// than leaving the theme for only the, well theme stuff such as the brand colors, spacing etc.

const theme = mode => {
  const defaultTheme = createMuiTheme({
    palette: {
      type: mode,
      primary: {
        // main: '#6200f2',
        // main: '#42A5F5',
        // main: '#2962FF',
        // main: '#82B1FF',
        // main: '#448AFF',
        main: mode === 'light' ? blue['A700'] : blue['A700'],
      },
      secondary: green,
      background: {
        extra: mode === 'light' ? 'rgba(0, 0, 0, 0.25)' : 'none',
        selectBox: mode === 'light' ? '#dadada' : '#888',
        contextual: mode === 'light' ? '#424242' : '#424242',
      },
    },
  })
  const returnedTheme = createMuiTheme({
    ...defaultTheme,
    overrides: {
      MuiFab: {
        root: {
          fontSize: '1.2rem',
        },
      },
      MuiSvgIcon: {
        root: {
          marginRight: '0.2rem',
          width: '1.2em',
          height: '1.2em',
        },
      },
    },
    typography: {
      useNextVariants: true,
    },
    form: {
      header: {
        textAlign: 'center',
        liveRates: {
          up: green['A200'],
          down: orange['300'],
        },
      },
      body: {
        padding: '2em 1em 3em 1em',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        color: defaultTheme.palette.text.secondary,
        fields: {
          label: {
            fontSize: '0.9em',
            transform: 'translate(1em, 1em) scale(1)',
          },
          inputBase: {
            paddingRight: '1em',
          },
          input: {
            height: '2rem',
            padding: '6px 1em 7px 1em',
          },
          switch: {
            marginLeft: '1em',
            fontSize: '0.9em',
          },
        },
      },
      footer: {
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
        },
        title: {
          fontSize: '8vmin',
          fontWeight: '300',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: defaultTheme.palette.primary.contrastText,
        },
        subtitle: {
          fontSize: '10vmin',
          fontWeight: '300',
          whiteSpace: 'pre-line',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: defaultTheme.palette.text.primary,
        },
      },
    },
  })

  if (typeof window !== 'undefined') window.theme = returnedTheme
  return returnedTheme
}

export default theme
