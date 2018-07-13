import * as React from 'react';
import withStyles, { WithStyles, StyleRulesCallback, } from '@material-ui/core/styles/withStyles';
import CustomTheme from '../components/CustomTheme';
import MenuAppbar from '../components/MenuAppbar';
import SideDrawer from '../components/SideDrawer';
import SplitPane from 'react-split-pane';
import ErrorNotification from '../containers/Notification';
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
  };
};

const Index: React.StatelessComponent<WithStyles<'root'>>
  = ({ classes }) => (
    <div className={classes.root}>
      <ErrorNotification />
      <MenuAppbar title="Ocelot" />
      <SplitPane
        split="vertical"
        defaultSize={250}
        minSize={0}
      >
        <SideDrawer />
        <main className="jumboContent">
          <JumboContent />
        </main>
      </SplitPane>
    </div>
  );

export default CustomTheme(withStyles(styles)(Index));
