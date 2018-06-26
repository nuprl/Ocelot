import * as React from 'react';
import withStyles, { WithStyles, StyleRulesCallback, } from '@material-ui/core/styles/withStyles';
// import createMuiTheme, { Theme } from '@material-ui/core/styles/createMuiTheme';
import customTheme from '../components/customTheme';
import MenuAppbar from '../components/MenuAppbar';
import Jumbotron from '../components/Jumbotron';
import SideDrawer from '../components/SideDrawer';
import '../styles/Jumbotron.css';
import SplitPane from 'react-split-pane';
import ErrorNotification from '../components/ErrorNotification';

// let themio: Theme = createMuiTheme({ palette: { type: 'dark' } });

const styles: StyleRulesCallback = theme => {
  // themio = theme;
  return {
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
    }
  };
};

type State = {
  loggedIn: boolean;
  error: boolean,
  errorMessage: string,
  files: { name: string, content: string }[],
  fileSaved: boolean[],
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
      fileSaved: []
    };
  }

  onLogin = () => {
    this.setState({ loggedIn: true });
  };

  onLogout = () => {
    this.setState(prevState => ({
      loggedIn: false,
      selectedFileIndex: -1,
      fileSaved: [],
      files: [],
    }));

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
    this.setState({ fileSaved: new Array(newFiles.length).fill(true) });
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
    this.setState(prevState => ({
      files: prevState.files.filter((elem, index) => index !== fileIndex)
    }));
    this.onSave();
  };

  onCreatedFile = (fileName: string) => {
    this.setState(prevState => ({
      files: [...prevState.files, { name: fileName, content: '' }]
    }));
    this.setState(prevState => ({
      fileSaved: [...prevState.fileSaved, true]
    }));
    this.fileChanges.push({ fileName: fileName, type: 'create' });
    this.onSave();
  };

  onUpdateSelectedFile = (fileIndex: number, content: string) => {
    if (fileIndex < 0 || fileIndex > this.state.files.length - 1) {
      return;
    }
    this.setState(prevState => ({
      files: prevState.files.map((elem, index) => {
        if (index === fileIndex) {
          return { name: elem.name, content: content };
        }
        return elem;
      })
    }));
    this.setState((prevState) => ({
      fileSaved: prevState.fileSaved.map((elem, index) => {
        if (index === fileIndex) {
          return false;
        }
        return elem;
      })
    }));
  };

  onSaveSelectedFile = (fileIndex: number, fileName: string) => {
    if (this.state.fileSaved[fileIndex]) {
      return;
    }

    if (typeof this.state.files[fileIndex] === 'undefined') {
      return;
    }
    this.fileChanges.push({ fileName: fileName, type: 'create', changes: this.state.files[fileIndex].content });
    this.onSave();
    this.setState((prevState) => ({
      fileSaved: prevState.fileSaved.map((elem, index) => {
        if (fileIndex === index) {
          return true;
        }
        return elem;
      })
    }));
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
      this.fileChanges = [];

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
    const { loggedIn, files, selectedFileIndex } = this.state;
    let transitionStyle: { transition?: string, width?: string } = {
      // transition: themio.transitions.create('width', {
      //   easing: themio.transitions.easing.sharp,
      //   duration: themio.transitions.duration.leavingScreen
      // })
    };

    return (
      <div className={classes.root}>
        <ErrorNotification />
        <MenuAppbar />
        <SplitPane
          split="vertical"
          minSize={250}
          pane1Style={transitionStyle}
        >
          <SideDrawer
            loggedIn={loggedIn}
            createSnackbarError={this.createSnackbarError}
            onUpdateFiles={this.onUpdateFiles}
            onSelectFile={this.onSelectFile}
            onDeleteFile={this.onDeleteFile}
            files={files}
            selectedFileIndex={selectedFileIndex}
            onCreatedFile={this.onCreatedFile}
            fileSaved={this.state.fileSaved}
          />
          <main
            className={`jumboContent ${classes.content} ${loggedIn ? classes.contentShift : ''}`}
          >
            <Jumbotron
              files={files}
              selectedFileIndex={selectedFileIndex}
              onUpdateSelectedFile={this.onUpdateSelectedFile}
              onSaveSelectedFile={this.onSaveSelectedFile}
              loggedIn={this.state.loggedIn}
            />
          </main>
        </SplitPane>
      </div>
    );
  }
}

export default customTheme(withStyles(styles)(Index));
