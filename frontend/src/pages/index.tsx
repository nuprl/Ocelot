import * as React from 'react';
import withStyles, { WithStyles, StyleRulesCallback } from '@material-ui/core/styles/withStyles';
import customTheme from '../customTheme';
import MenuAppbar from '../components/MenuAppbar';
import Jumbotron from '../components/Jumbotron';

const styles: StyleRulesCallback = theme => ({
  root: {
    minWidth: '350px',
    minHeight: '100vh',
    margin: '0',
    padding: '0',
  }
});

class Index extends React.Component<WithStyles<string>> {

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <MenuAppbar />
        <Jumbotron />
      </div>
    );
  }
}

export default customTheme(withStyles(styles)(Index));
