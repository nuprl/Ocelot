import * as React from 'react';
import withStyles, { WithStyles, StyleRulesCallback } from '@material-ui/core/styles/withStyles';
import customTheme from '../customTheme';
import MenuAppbar from '../components/MenuAppbar';
import Jumbotron from '../components/Jumbotron';
import SideDrawer from '../components/SideDrawer';
import { drawerWidth } from '../components/SideDrawer';
import ErrorSnackbar from '../components/ErrorSnackbar';

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
  error: boolean,
  errorMessage: string,
  files: {name: string, content: string}[],
  selectedFileIndex: number,
};

class Index extends React.Component<WithStyles<string>, State> {

  constructor(props: WithStyles<string>) {
    super(props);
    this.state = {
      loggedIn: false,
      error: false,
      errorMessage: '',
      files: [],
      selectedFileIndex: -1, // implying no file is selected.
    };
  }

  onLogin = () => {
    this.setState({ loggedIn: true });
  }

  onLogout = () => {
    this.setState({ loggedIn: false });
  }

  handleCloseSnackbar = (event: React.SyntheticEvent<any>, reason: string): void => {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ error: false });
  }
  handleCloseClickSnackbar = (event: React.MouseEvent<HTMLElement>): void => {
    this.setState({ error: false });
  }

  createSnackbarError = (message: string) => {
    this.setState({ error: true });
    this.setState({ errorMessage: message });
  }

  onUpdateFiles = (newFiles: {name: string, content: string}[]) => {
    this.setState({files: newFiles});
  }

  onSelectFile = (fileIndex: number): void => {
    this.setState({selectedFileIndex: fileIndex});
  }

  render() {
    const { classes } = this.props;
    const { loggedIn, error, errorMessage, files, selectedFileIndex } = this.state;

    return (
      <div className={classes.root}>
        <ErrorSnackbar
          open={error}
          handleClose={this.handleCloseSnackbar}
          handleClick={this.handleCloseClickSnackbar}
          message={errorMessage}
        />
        <MenuAppbar
          onLogin={this.onLogin}
          onLogout={this.onLogout}
          createSnackbarError={this.createSnackbarError}
        />
        <SideDrawer
          loggedIn={loggedIn}
          createSnackbarError={this.createSnackbarError}
          onUpdateFiles={this.onUpdateFiles}
          onSelectFile={this.onSelectFile}
        />
        <main
          className={`${classes.content} ${loggedIn ? classes.contentShift : ''}`}
        >
          <div className={classes.toolbar} />
          <Jumbotron files={files} selectedFileIndex={selectedFileIndex}/>
        </main>
      </div>
    );
  }
}

export default customTheme(withStyles(styles)(Index));
