import * as React from 'react';
import withStyles, { WithStyles, StyleRulesCallback, } from '@material-ui/core/styles/withStyles';
import CustomTheme from './components/CustomTheme';
import * as JumboContent from './JumboContent';
import { loadLibraries } from './sandbox';
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

type LibsLoad =
  | 'ready'
  | 'failed'
  | 'waiting'

export class Index extends React.Component<WithStyles<WithStylesClasses>, {
  allLibsLoaded: LibsLoad
}> {

  constructor(props: WithStyles<WithStylesClasses>) {
    super(props);
    this.state = {
      allLibsLoaded: 'waiting'
    };
  }

  componentDidMount() {
    loadLibraries().then(() => {
      this.setState({
        allLibsLoaded: 'ready'
      });
    }, (err) => {
      console.error(`Could not load libraries: ${JSON.stringify(err)}.`);
      this.setState({
        allLibsLoaded: 'failed'
      });
    });
  }

  render() {
    const browser = detect();
    switch (browser && browser.name) {
      case 'chrome':
      case 'firefox':
      case 'safari':
      case 'ios':
        switch (this.state.allLibsLoaded) {
          case 'waiting':
            return (
              <Typography variant="display1" align="center">
                Loading...
              </Typography>
            );
          case 'failed':
            return (
              <Typography variant="display1" align="center">
                Failed; try to refesh the page.
              </Typography>
            );
          default: //ready
            const { classes } = this.props;
            return (<JumboContent.JumboContentDefault classes={classes} />);
        }
      default:
        return (
          <Typography variant="display1" align="center">
            Your browser is unsupported; please use Chrome, Firefox, or Safari.
          </Typography>
        );
    }
  }
}

export default CustomTheme(withStyles(styles)(Index));
