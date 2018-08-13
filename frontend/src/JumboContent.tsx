import * as React from 'react';
import SplitPane from 'react-split-pane';
import CanvasOutput from './components/CanvasOutput';
import OutputPanel from './OutputPanel';
import 'static/styles/SplitPane.css';
import red from '@material-ui/core/colors/red';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import PlayIcon from '@material-ui/icons/PlayArrow';
import CodeEditor from './containers/CodeEditor';
import ExploreIcon from '@material-ui/icons/Spellcheck';
import Button from '@material-ui/core/Button';
import StopIcon from '@material-ui/icons/Stop';
import DownloadIcon from '@material-ui/icons/ArrowDownward';
import * as types from './types';
import { RootState } from './store';
import { connect } from 'react-redux';
import { saveHistory } from './utils/api/saveHistory'
import { isFailureResponse, FileChange } from './utils/api/apiHelpers';
import SideDrawer from './components/SideDrawer';
import Notification from './containers/Notification';
import * as sandbox from './sandbox';
import UserLogin from './loginButton';
import HistoryButton from './containers/HistoryButton';

// import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import FileIcon from '@material-ui/icons/FileCopy';
import CanvasIcon from '@material-ui/icons/Wallpaper';
import ConsoleIcon from '@material-ui/icons/NavigateNext';
import { saveChanges } from './utils/api/saveFileChanges';
import { triggerNotification } from './store/notification/actions';
import { Dispatch } from 'redux';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


const classes = {
  flex: {
    flex: '1',
  },
  icon: {
    marginBottom: '0.25em',
    marginRight: '1.5',
  },
  title: {
    fontFamily: 'Fira Mono, Roboto, Arial, sans-serif',
    fontWeight: '400',
  },
};


const redTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: red,
  }
});

type Props = {
  loggedIn: boolean,
  dispatch: Dispatch,
  classes: {
    root: string,
    jumboContent: string,
    toolbar: string,
    jumboContainer: string
  },
}

type ExecutionProps = {
  sandbox: sandbox.Sandbox, 
  loggedIn: boolean,
  filename: string
}
class ExecutionButtons extends React.Component<ExecutionProps, { mode : sandbox.Mode }> {

  constructor(props: ExecutionProps) {
    super(props);
    this.state = { mode: 'stopped' };
  }
  
  componentDidMount() {
    this.props.sandbox.addModeListener((mode) => {
      this.setState({ mode: mode });
    });
  }

  onRunOrTestClicked(mode: 'running' | 'testing') {
    if (this.props.loggedIn) {
      // TODO(arjun): MUST be more robust. Cannot suppress errors.
      saveHistory(this.props.filename, this.props.sandbox.getCode()).then((res) => {
        if (isFailureResponse(res)) {
          console.log('Something went wrong');
          console.log(res.data.message);
          return;
        }
      }).catch(err => console.log(err)); // will do for now
    }
    this.props.sandbox.onRunOrTestClicked(mode);
  }

  render() {
    return [
      <Button key="run-button" color="secondary"
        onClick={() => this.onRunOrTestClicked('running')}
        disabled={this.state.mode !== 'stopped'}>
        <PlayIcon color="inherit" />
        Run
      </Button>,
      <Button key="test-button" color="secondary"
        onClick={() => this.onRunOrTestClicked('testing')}
        disabled={this.state.mode !== 'stopped'}>
        <ExploreIcon color="inherit" />
        Test
      </Button>,
      <MuiThemeProvider key="stop-button" theme={redTheme}>
        <Button
          color="primary"
          onClick={() => this.props.sandbox.onStopClicked()}
          disabled={this.state.mode === 'stopped' || this.state.mode === 'stopping'}>
          <StopIcon color="inherit" />
          Stop
      </Button>
      </MuiThemeProvider>
    ];
  }
}

const MustLoginDialog: React.StatelessComponent<{open: boolean, onClose: () => void }> = 
  ({ open, onClose }) => (
    <Dialog
          open={open}
          onClose={onClose}
          aria-labelledby="must-login"
          aria-describedby="user must login to use editor"
    >
          <DialogTitle id="must-login">{"Login required"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Login is required and files need to be fully loaded to use Ocelot.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="secondary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
  );


type JumboContentState = {
  files: {name: string, content: string}[],
  selectedFileIndex: number,
  mustLoginDialogOpen: boolean,
}
class JumboContent extends React.Component<Props, JumboContentState> {

  private console!: types.HasConsole;
  private sandbox: sandbox.Sandbox;

  constructor(props: Props) {
    super(props);
    this.sandbox = new sandbox.Sandbox();
    this.state = {
      files: [ { name: 'HelloWorld.js', content: `// write your code here`}],
      selectedFileIndex: 0,
      mustLoginDialogOpen: false,
    }
  }

  saveCode = (fileIndex: number, content: string) => {
    this.setState((prevState) => {
      const newFile = prevState.files.map((elem, index) => {
        if (index === fileIndex) {
          return { name: elem.name, content: content}
        }
        return elem;
      });
      return {files: newFile};
    });
  };

  saveCodeCloud = (fileName: string, fileIndex: number, code: string, loggedIn: boolean) => {
    if (!loggedIn) {
      return;
    }
    console.log('Saving code to cloud!');
    const change: FileChange[] = [
      {
        fileName: fileName,
        type: 'create',
        changes: code,
      }
    ];
    saveChanges(change).then((response) => {
      if (isFailureResponse(response)) {
        console.log('Could not save to cloud');
      }
      console.log('Saved to cloud!');
    }).catch((err) => console.log('An error occurred!', err));
  };

  makeHandleClickFile = (fileIndex: number) => (() => {
    this.setState({ selectedFileIndex: fileIndex });
  });

  makeHandleDeleteFile = (fileIndex: number, name: string, loggedIn: boolean) => (() => {
    const response = prompt("Are you sure you want to delete this file? Enter YES or NO");
    if (response !== "YES") {
      this.props.dispatch(triggerNotification(`Delete aborted: ${name}`, 'bottom-right'));
      return;
    }
    this.setState((prevState) => {
      let newFiles = [...prevState.files].filter((elem, index) => {
        if (index === fileIndex) {
          return false;
        }
        return true;
      });
      return { files: newFiles, selectedFileIndex: -1 }
    });
    if (!loggedIn) {
      return;
    }
    saveChanges([{
      fileName: name,
      type: 'delete',
    }]).then((response) => {
      if (isFailureResponse(response)) {
        console.log('Oh no! File not deleted!');
      }
      console.log('File delete!');
    }).catch(error => console.log('cannot delete file', error));
  });

  onCreateFile = (fileName: string, loggedIn: boolean) => {
    if (!loggedIn) {
      return;
    }
    this.setState((prevState) => {
      let newFiles = [...prevState.files, {name: fileName, content: ''}]
      return {
        files: newFiles,
        selectedFileIndex: newFiles.length - 1,
      };
    });
    saveChanges([{
        fileName: fileName,
        type: 'create',
        changes: '',
      }]).then((response) => {
        if (isFailureResponse(response)) {
          console.log('Oh no! File could not be created');
        }
        console.log('File created!');
      }).catch(err => console.log('Could not create file!', err));

  };

  setFiles = (userFiles: {name: string, content: string}[]) => {
    this.setState({
      files: userFiles,
      selectedFileIndex: -1,
    })
  };

  onDownload = () => {
    let element = document.createElement("a");
    let file = new Blob([this.sandbox.getCode()], {type: 'application/javascript'});
    element.href = URL.createObjectURL(file);
    element.download = this.state.files[this.state.selectedFileIndex].name;
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  togglePanel = (elementId: string, 
    styleProperty: 'width' | 'height', 
    defaultSize: number | string, // if default size is number, it'll be in pixel
    closedSize: number | string ) => {
    let element = document.getElementById(elementId);
    if (element === null) {
      return;
    }
    const numberRegx = /(\d*\.)?\d+/;
    if (typeof defaultSize === 'string' && !numberRegx.test(defaultSize)) {
      return;
    }
    if (typeof closedSize === 'string' && !numberRegx.test(closedSize)) {
      return;
    }
    let parent = element.parentElement as HTMLElement; // assuming element must have parent
    closedSize = typeof closedSize === 'number' ? `${closedSize}px` : closedSize;
    let currentStyle = parent.getAttribute('style');
    if (currentStyle === null) {
      parent.setAttribute('style', `${styleProperty}: ${closedSize};`);
      return;
    }
    const stylePropRegx = new RegExp(`(m(?:in|ax)-)?${styleProperty}\\s*:\\s*\\d+(?:\\.\\d*)?[a-zA-Z%]+;?`, 'g');
    let matches: string[] = [], matcher;
    matcher = stylePropRegx.exec(currentStyle);
    while (matcher !== null) { // negative lookbehind alternative
      if (!matcher[1]) {
        matches.push(matcher[0]);
      }
      matcher = stylePropRegx.exec(currentStyle);
    }
    if (matches.length <= 0) { // if no width/height is set
      parent.style[styleProperty] = closedSize
      return;
    }

    const container = parent.parentElement as HTMLElement; // panel must have a parent, SplitPane
    const containerLength = styleProperty === 'width' ? container.clientWidth : container.clientHeight;
    const latestPropertyVal = styleProperty === 'width' ? parent.clientWidth : parent.clientHeight;
    let closedSizeVal = Number((closedSize.match(numberRegx) as RegExpMatchArray)[0]);
    if (closedSize.includes('%')) {
      closedSizeVal = (closedSizeVal / 100) * containerLength;
    }
    const isTiny = Math.abs(latestPropertyVal - closedSizeVal) < 30; // will not with cmp % and px
    if (isTiny && matches.length === 1) { // if tiny width/height set by user
      defaultSize = typeof defaultSize === 'number' ? `${defaultSize}px` : defaultSize
      parent.style[styleProperty] = defaultSize; // toggle back to default
      return;
    }
    if (isTiny && matches.length > 1) {
      // remove latest width/height
      let currIndex = -1;
      parent.setAttribute('style', 
        currentStyle.replace(stylePropRegx, (match, groupOne) => {
            if (typeof groupOne === 'undefined') { // if matched
              currIndex += 1;
            }
            if (currIndex === matches.length - 1 && typeof groupOne === 'undefined') {
              return ''; // replace the match
            }
            return match;
        }));
      return;
    }
    const endsInSemicolon = /;\s*$/.test(currentStyle);
    const semicolon = endsInSemicolon ? '' : ';';
    parent.setAttribute('style', currentStyle + semicolon + `${styleProperty}: ${closedSize};`);
  };

  render() {

    const { selectedFileIndex, files, mustLoginDialogOpen } = this.state;
    const isSelected = selectedFileIndex !== -1;
    const fileInfo = {
      code: isSelected ? files[selectedFileIndex].content : '',
      fileName: isSelected ? files[selectedFileIndex].name : '',
      enabled: isSelected,
      fileIndex: selectedFileIndex
    }
    const userFilesInfo = {
      files: this.state.files,
      selectedFileIndex: this.state.selectedFileIndex,
    };

    return (
      <div className={this.props.classes.root}>
        <Notification />
        <MustLoginDialog 
          open={mustLoginDialogOpen} 
          onClose={() => this.setState({ mustLoginDialogOpen: false})}
        />
        <AppBar position="absolute">
          <Toolbar variant="dense">
            <Button
              color="secondary"
              onClick={() => this.togglePanel('sideDrawer', 'width', 250, 0)}>
              <FileIcon />
              Files
            </Button>
            <ExecutionButtons 
              filename={fileInfo.fileName} 
              loggedIn={this.props.loggedIn}
              sandbox={this.sandbox} />
            <Button
              color="secondary"
              disabled={!isSelected}
              onClick={this.onDownload}>
              <DownloadIcon />
              Download
            </Button>
            <Button
              color="secondary"
              onClick={() => this.togglePanel('outputPanel', 'height', '25%', 0)}>
              <ConsoleIcon />
              Console
            </Button>
            <Button
              color="secondary"
              onClick={() => this.togglePanel('codeEditor', 'width', '50%', '100%')}>
              <CanvasIcon />
              Canvas
            </Button>
            <HistoryButton fileName={fileInfo.fileName} code={fileInfo.code}/>
            <div style={classes.flex} />
            <div style={{ display: 'inline-block', width: '0.5em' }} />
            <UserLogin setFiles={this.setFiles}/>
          </Toolbar>
        </AppBar>
        <SplitPane split="vertical" defaultSize={250} minSize={0}>
          <SideDrawer 
            userFilesInfo={userFilesInfo} 
            makeHandleClickFile={this.makeHandleClickFile}
            makeHandleDeleteFile={this.makeHandleDeleteFile}
            onCreateFile={this.onCreateFile}
          />
          <div className={this.props.classes.jumboContainer}>
            <div className={this.props.classes.toolbar} style={{ minHeight: '48px' }} />
            {/* Gotta figure out a way to not override css with inline-style */}
            <div className={this.props.classes.jumboContent}>
              <SplitPane
                split="horizontal"
                minSize={0}
                defaultSize="25%"
                primary="second"
                pane2Style={{ maxHeight: '100%' }}
              >
                <SplitPane
                  split="vertical"
                  defaultSize="50%"
                  minSize={0}
                  maxSize="100%"
                  pane1Style={{ maxWidth: '100%' }}>
                  <div style={{ width: '100%', height: '100%', minWidth: '286px' }} id="codeEditor">
                    <CodeEditor 
                      updateCode={(code) => this.sandbox.setCode(code)} 
                      fileInfo={fileInfo}
                      saveCode={this.saveCode}
                      saveCodeCloud={this.saveCodeCloud}
                      openMustLogin={() => this.setState({mustLoginDialogOpen: true})}
                    />
                  </div>
                  <CanvasOutput />
                </SplitPane>
                <OutputPanel 
                  sandbox={this.sandbox} 
                  aref={x => this.console = x} 
                  openMustLogin={() => this.setState({mustLoginDialogOpen: true})}
                />
              </SplitPane>
            </div>
          </div>
        </SplitPane>
      </div>
    );
  }

}

const mapStateToProps = (state: RootState) => ({
  loggedIn: state.userLogin.loggedIn,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch: dispatch
});

export const JumboContentDefault  = connect(mapStateToProps, mapDispatchToProps)(JumboContent);
