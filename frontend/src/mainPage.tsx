import * as React from 'react';
import withStyles, { WithStyles, StyleRulesCallback, } from '@material-ui/core/styles/withStyles';
import CustomTheme from './components/CustomTheme';
import JumboContent from './JumboContent';
import { detect } from 'detect-browser';
import 'static/styles/JumboContent.css';
import 'static/styles/body.css';
import Typography from '@material-ui/core/Typography';


const styles: StyleRulesCallback = theme => {
  return {
    root: {
      flexGrow: 1,
      height: '100vh',
      width: '100vw',
      zIndex: 1,
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      backgroundColor: theme.palette.primary.main,
    },
    jumboContainer: {
      display: 'flex',
      flexFlow: 'column',
      height: '100%',
    },
    jumboContent: {
      position: 'relative',
      height: '100%',
      flex: '1 1 auto',
    },
    toolbar: {
      ...theme.mixins.toolbar,
      flex: '0 1 auto',
    },
  };
};

type WithStylesClasses =
  | 'root'
  | 'jumboContent'
  | 'toolbar'
  | 'jumboContainer';

class Index extends React.Component<WithStyles<WithStylesClasses>> {

      render() {
        const browser = detect();
        console.log(this.props);
        switch (browser && browser.name) {
          case 'chrome':
          case 'firefox':
          case 'safari':
          case 'ios':
            const { classes } = this.props;
            return (<JumboContent classes={classes} />);
          default:
            return (
              <Typography variant="display1" align="center">
                Your browser is unsupported, please use chrome, firefox or safari.
          </Typography>
            );
        }
      }
    }

export default CustomTheme(withStyles(styles)(Index));
