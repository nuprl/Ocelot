import * as React from 'react';
import withStyles, { WithStyles, StyleRulesCallback, } from '@material-ui/core/styles/withStyles';
import CustomTheme from '../components/CustomTheme';
import MenuAppbar from '../components/MenuAppbar';
import SideDrawer from '../components/SideDrawer';
import SplitPane from 'react-split-pane';
import Notification from '../containers/Notification';
import JumboContent from 'components/JumboContent';
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
