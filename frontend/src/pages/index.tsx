import * as React from 'react';
import withStyles, { WithStyles, StyleRulesCallback } from '@material-ui/core/styles/withStyles';
import customTheme from '../customTheme';
import MenuAppbar from '../components/MenuAppbar';
import Jumbotron from '../components/Jumbotron';
import SideDrawer from '../components/SideDrawer';

const styles: StyleRulesCallback = theme => ({
  root: {
    flexGrow: 1,
    height: '100vh',
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
  },

  content: {
    flexGrow: 1,
    minWidth: 0, // So the Typography noWrap works
    backgroundColor: theme.palette.primary.main,
  },
  toolbar: theme.mixins.toolbar,
});

type State = {
  loggedIn: boolean;
};

class Index extends React.Component<WithStyles<string>, State> {

  state = {
    loggedIn: false,
  };

  onLogin = () => {
    this.setState({loggedIn: true});
  }

  onLogout = () => {
    this.setState({loggedIn: false});
  }

  render() {
    const { classes } = this.props;
    const { loggedIn } = this.state;

    return (
      <div className={classes.root}>
        <MenuAppbar onLogin={this.onLogin} onLogout={this.onLogout}/>
        <SideDrawer loggedIn={loggedIn}/>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Jumbotron />
        </main>
      </div>
    );
  }
}

export default customTheme(withStyles(styles)(Index));
