import * as React from 'react';
import withStyles, { WithStyles, StyleRulesCallback } from '@material-ui/core/styles/withStyles';
import customTheme from '../customTheme';
import MenuAppbar from '../components/MenuAppbar';
import Jumbotron from '../components/Jumbotron';
import SideDrawer from '../components/SideDrawer';
import { drawerWidth } from '../components/SideDrawer';

const styles: StyleRulesCallback = theme => ({
  root: {
    flexGrow: 1,
    height: '100vh',
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    backgroundColor: theme.palette.primary.main,
  },

  content: {
    flexGrow: 1,
    minWidth: 0, // So the Typography noWrap works
    // animations
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  toolbar: theme.mixins.toolbar,
});

type State = {
  loggedIn: boolean;
};

class Index extends React.Component<WithStyles<string>, State> {

  constructor(props: WithStyles<string>) {
    super(props);
    this.state = {
      loggedIn: false,
    };
  }

  onLogin = () => {
    this.setState({ loggedIn: true });
  }

  onLogout = () => {
    this.setState({ loggedIn: false });
  }

  render() {
    const { classes } = this.props;
    const { loggedIn } = this.state;

    return (
      <div className={classes.root}>
        <MenuAppbar onLogin={this.onLogin} onLogout={this.onLogout} />
        <SideDrawer loggedIn={loggedIn} />
        <main
          className={`${classes.content} ${loggedIn ? classes.contentShift : ''}`}
        >
          <div className={classes.toolbar} />
          <Jumbotron />
        </main>
      </div>
    );
  }
}

export default customTheme(withStyles(styles)(Index));
