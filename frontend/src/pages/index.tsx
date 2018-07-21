import * as React from 'react';
import withStyles, { WithStyles, StyleRulesCallback, } from '@material-ui/core/styles/withStyles';
import CustomTheme from '../components/CustomTheme';
import MenuAppbar from '../components/MenuAppbar';
import SideDrawer from '../components/SideDrawer';
import SplitPane from 'react-split-pane';
import Notification from '../containers/Notification';
import JumboContent from 'components/JumboContent';
import 'static/styles/JumboContent.css';
import 'static/styles/body.css';

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

const Index: React.StatelessComponent<WithStyles<WithStylesClasses>>
  = ({ classes }) => (
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

export default CustomTheme(withStyles(styles)(Index));
