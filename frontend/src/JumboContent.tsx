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
import UserLogin from './containers/UserLogin';
import HistoryButton from './containers/HistoryButton';

// import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import PawIcon from '@material-ui/icons/Pets';
import FileIcon from '@material-ui/icons/FileCopy';
import CanvasIcon from '@material-ui/icons/Wallpaper';
import ConsoleIcon from '@material-ui/icons/NavigateNext';
import { saveChanges } from './utils/api/saveFileChanges';
import { triggerNotification } from './store/notification/actions';
import { Dispatch } from 'redux';


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


type JumboContentState = {
  files: {name: string, content: string}[],
  selectedFileIndex: number,
}
class JumboContent extends React.Component<Props, JumboContentState> {

  private console!: types.HasConsole;
  private sandbox: sandbox.Sandbox;

  constructor(props: Props) {
    super(props);
    this.sandbox = new sandbox.Sandbox();
    this.state = {
      files: [ { name: 'HelloWorld.js', content: `console.log('1');`}],
      selectedFileIndex: -1,
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
    element.click();
  };

  render() {

    const { selectedFileIndex, files } = this.state;
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
        <AppBar position="absolute">
          <Toolbar variant="dense">
            <PawIcon style={classes.icon} />
            <Typography variant="subheading" color="inherit" noWrap>
              Ocelot
            </Typography>
            <div style={{ width: 50 }} />
            <Button
              color="secondary"
              onClick={() => console.log("Clicked files")}>
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
              onClick={() => console.log("Clicked console")}>
              <ConsoleIcon />
              Console
            </Button>
            <Button
              color="secondary"
              onClick={() => console.log("Clicked canvas")}>
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
                  pane1Style={{ maxWidth: '100%' }}>
                  <div style={{ width: '100%', height: '100%', minWidth: '286px' }}>
                    <CodeEditor 
                      updateCode={(code) => this.sandbox.setCode(code)} 
                      fileInfo={fileInfo}
                      saveCode={this.saveCode}
                      saveCodeCloud={this.saveCodeCloud}
                    />
                  </div>
                  <CanvasOutput />
                </SplitPane>
                <OutputPanel sandbox={this.sandbox} aref={x => this.console = x} />
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
