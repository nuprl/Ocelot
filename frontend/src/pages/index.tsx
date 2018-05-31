import * as React from 'react';
import withStyles, { WithStyles, StyleRulesCallback } from '@material-ui/core/styles/withStyles';
import customTheme from '../customTheme';
import MenuAppbar from '../components/MenuAppbar';

const styles: StyleRulesCallback<'root'> = theme => ({
  root: {
  },
});

class Index extends React.Component<WithStyles<'root'>> {

  render() {
    return (
      <div className={this.props.classes.root}>
        <MenuAppbar />
      </div>
    );
  }
}

export default customTheme(withStyles(styles)(Index));
