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
  files: { name: string, content: string }[],
  selectedFileIndex: number,
};

type FileChange = {
  fileName: string,
  type: 'delete' | 'create' | 'rename',
  changes?: string,
};

class Index extends React.Component<WithStyles<string>, State> {
  fileChanges: FileChange[];
  fileChangesWhileSaving: FileChange[]; 
  // since saving is asynchronous, a user can make changes to files while saving files.
  // What saving files does is it posts the data to the backend and clears fileChanges array
  // if they made changes and fileChanges has new changes while the old data is sent
  // the new changes could potentially be erased, to prevent that, we need a second 
  // array to make sure no changes gets erased while saving.
  constructor(props: WithStyles<string>) {
    super(props);
    this.fileChanges = [];
    this.fileChangesWhileSaving = [];
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
  };

  onLogout = () => {
    this.setState({ loggedIn: false });
  };

  handleCloseSnackbar = (event: React.SyntheticEvent<any>, reason: string): void => {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ error: false });
  };
  handleCloseClickSnackbar = (event: React.MouseEvent<HTMLElement>): void => {
    this.setState({ error: false });
  };

  createSnackbarError = (message: string) => {
    this.setState({ error: true });
    this.setState({ errorMessage: message });
  };

  onUpdateFiles = (newFiles: { name: string, content: string }[]) => {
    this.setState({ files: newFiles });
  };

  onSelectFile = (fileIndex: number): void => {
    this.setState({ selectedFileIndex: fileIndex });
  };

  onDeleteFile = (fileIndex: number): void => {
    if (fileIndex === this.state.selectedFileIndex) {
      this.setState({ selectedFileIndex: -1 });
    }
    this.fileChanges.push({
      fileName: this.state.files[fileIndex].name,
      type: 'delete'
    });
    this.state.files.splice(fileIndex, 1);
    this.setState({ files: this.state.files });
    this.onSave();
  };

  onCreatedFile = (fileName: string) => {
    this.state.files.push({name: fileName, content: ''});
    this.setState({files: this.state.files});
    this.fileChanges.push({fileName: fileName, type: 'create'});
    this.onSave();
  };

  saveChanges = async (userEmail: string, sessionId: string) => {
    let url = 'https://us-central1-umass-compsci220.cloudfunctions.net/paws/changefile';
    // domain to send post requests to

    if (window.location.host.substring(0, 9) === 'localhost') { // if hosted on localhost
      url = 'http://localhost:8000/changefile';
    }

    const data = { userEmail: userEmail, sessionId: sessionId, fileChanges: this.fileChanges };

    try {
      const response = await fetch(url, { // send json data to specified URL
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status !== 200) {
        // create snackbar
        this.createSnackbarError(`ERRORORORO`);
        return;
      }

      const jsonResponse = await response.json(); // get json response

      if (jsonResponse.status === 'error') {
        // create snackbar
        this.createSnackbarError(`OLOLOLOLOLOLOL`);
        return;
      }

      if (jsonResponse.status === 'failure') {
        // create snackbar
        this.createSnackbarError(`ASDSDSDAS`);
        return;
      }

    } catch (error) {
      // create snackbar
      this.createSnackbarError(`Couldn't connect to the server at the moment, try again later`);
    }
  };

  onSave = () => {
    const userEmail = localStorage.getItem('userEmail');
    const sessionId = localStorage.getItem('sessionId');

    if (userEmail !== null && sessionId !== null) {
      this.saveChanges(userEmail, sessionId);
      return;
    }

    this.createSnackbarError('Seems like your session expired, try logging in again');
  };

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
          onDeleteFile={this.onDeleteFile}
          files={files}
          selectedFileIndex={selectedFileIndex}
          onCreatedFile={this.onCreatedFile}
        />
        <main
          className={`${classes.content} ${loggedIn ? classes.contentShift : ''}`}
        >
          <div className={classes.toolbar} />
          <Jumbotron files={files} selectedFileIndex={selectedFileIndex} />
        </main>
      </div>
    );
  }
}

export default customTheme(withStyles(styles)(Index));
