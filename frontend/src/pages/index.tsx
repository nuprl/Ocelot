import * as React from 'react';
import withStyles, { WithStyles, StyleRulesCallback } from '@material-ui/core/styles/withStyles';
import customTheme from '../customTheme';
import MenuAppbar from '../components/MenuAppbar';
import Jumbotron from '../components/Jumbotron';
import SideDrawer from '../components/SideDrawer';

const styles: StyleRulesCallback = theme => ({
  root: {
    // minWidth: '350px',
    // minHeight: '100vh',
    // zIndex: 1,
    // margin: '0',
    // padding: '0',
    // backgroundColor: theme.palette.primary.main,
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

class Index extends React.Component<WithStyles<string>> {

  componentDidMount() {
    setTimeout(() => this.setState({ loading: false }), 1000 + Math.random() * 800);
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <MenuAppbar />
        <SideDrawer />
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Jumbotron />
        </main>
      </div>
    );
  }
}

export default customTheme(withStyles(styles)(Index));
