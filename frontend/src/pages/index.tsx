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
  // themio = theme;
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
    jumboContent: {
      position: 'relative',
      height: '100%',
    },
    toolbar: theme.mixins.toolbar,
  };
};

const Index: React.StatelessComponent<WithStyles<'root' | 'jumboContent' | 'toolbar'>>
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
        <div style={{height: '100%'}}>
          <div className={classes.toolbar} />
          <div className={classes.jumboContent}>
            <JumboContent />
          </div>
        </div>
      </SplitPane>
    </div>
  );

export default CustomTheme(withStyles(styles)(Index));
