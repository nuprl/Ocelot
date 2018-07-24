import * as React from 'react';
import withStyles, { WithStyles, StyleRulesCallback, } from '@material-ui/core/styles/withStyles';
import CustomTheme from '../components/CustomTheme';
import MenuAppbar from '../components/MenuAppbar';
import SideDrawer from '../components/SideDrawer';
import SplitPane from 'react-split-pane';
import Notification from '../containers/Notification';
import JumboContent from '../components/JumboContent';
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


function load220Library() {
  // NOTE(arjun): I tried to create a <script> in the render block
  // but it did not work. If someone can do that, it would be slightly
  // cleaner than this.
  // Note that writing an unmount handler is pointless since removing
  // a script tag does not "un-execute" its code.
  const script = document.createElement('script');
  if (window.location.hostname === 'localhost') {
    console.info('Loading 220 library from build/lib220.js');
    script.src = 'lib220.js';
  }
  else {
    console.error('Missing path for lib220.js in production'); // TODO
    return;
  }
  document.body.appendChild(script);
}

class Index extends React.Component<WithStyles<WithStylesClasses>> {
  componentDidMount() {
    load220Library();
  }

  render() {
    const browser = detect();
    switch (browser && browser.name) { // kind of janky with a swtich statement but okay
      case 'chrome':
      case 'firefox':
      case 'safari':
        const { classes } = this.props;
        return (
          <div className={classes.root}>
            <Notification />
            <MenuAppbar title="Ocelot" />
            <SplitPane
              split="vertical"
              defaultSize={250}
              minSize={0}
            >
              <SideDrawer />
              <div className={classes.jumboContainer}>
                <div className={classes.toolbar} />
                <div className={classes.jumboContent}>
                  <JumboContent />
                </div>
              </div>
            </SplitPane>
          </div>
        );
      default:
        return (
          <Typography variant="display1" align="center">
            Lol, go use chrome, firefox or safari
          </Typography>
        );
    }
  }
}

export default CustomTheme(withStyles(styles)(Index));
