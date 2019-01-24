import * as React from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

// A theme with custom primary and secondary color.
// It's optional.
const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#484848',
      main: '#212121',
      dark: '#000000',
      contrastText: '#fff',
    },
    secondary: {
      light: '#80d6ff',
      main: '#42a5f5',
      dark: '#0077c2',
      contrastText: '#fff',
    },
    type: 'dark'
  },
  zIndex: { // lets monaco editor hover/context info cover over appbar and drawer
    drawer: 1,
    appBar: 2,
  },
  overrides: {
    MuiButton : {
      root: {
        paddingLeft: '8px',
        paddingRight: '8px',
        minWidth: '0px',
      }
    }
  }
});

function CustomTheme(Component: React.ComponentType) {
  function customTheme(props: object) {
    // MuiThemeProvider makes the theme available down the React tree
    // thanks to React context.
    return (
      <MuiThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Component {...props} />
      </MuiThemeProvider>
    );
  }

  return customTheme;
}

export default CustomTheme;
