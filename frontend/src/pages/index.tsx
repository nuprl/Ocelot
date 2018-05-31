import * as React from 'react';
import withStyles, { WithStyles, StyleRulesCallback } from '@material-ui/core/styles/withStyles';
import withRoot from '../withRoot';
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

export default withRoot(withStyles(styles)(Index));
