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
import { saveHistory } from './utils/api/saveHistory'
import { isFailureResponse } from './utils/api/apiHelpers';
import SideDrawer from './components/SideDrawer';
import Notification from './containers/Notification';
import * as sandbox from './sandbox';
import UserLogin from './loginButton';
import HistoryButton from './containers/HistoryButton';
import * as state from './state';
import './autosave';

// import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import FileIcon from '@material-ui/icons/FileCopy';
import CanvasIcon from '@material-ui/icons/Wallpaper';
import ConsoleIcon from '@material-ui/icons/NavigateNext';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

(window as any).globalState = state;

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
  classes: {
    root: string,
    jumboContent: string,
    toolbar: string,
    jumboContainer: string
  },
}

type ExecutionProps = {
  sandbox: sandbox.Sandbox
}

class ExecutionButtons extends React.Component<ExecutionProps, { mode : sandbox.Mode, loggedIn: boolean }> {

  constructor(props: ExecutionProps) {
    super(props);
    this.state = { 
      mode: 'stopped',
      loggedIn: state.loggedIn.getValue()
    };
  }
  
  componentDidMount() {
    this.props.sandbox.addModeListener((mode) => {
      this.setState({ mode: mode });
    });
  }

  onRunOrTestClicked(mode: 'running' | 'testing') {
    if (this.state.loggedIn) {
      // TODO(arjun): MUST be more robust. Cannot suppress errors.
      const filename = state.files.getValue()[state.selectedFileIndex.getValue()].name;
      saveHistory(filename, state.currentProgram.getValue()).then((res) => {
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
      selectedFileIndex: 0,
      mustLoginDialogOpen: false,
    }
  }

  componentDidMount() {
    state.selectedFileIndex.subscribe(x => this.setState({ selectedFileIndex: x }));
  }

  onDownload = () => {
    let element = document.createElement("a");
    let file = new Blob([state.currentProgram.getValue()], {type: 'application/javascript'});
    element.href = URL.createObjectURL(file);
    element.download = state.currentFileName();
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

    const { selectedFileIndex, mustLoginDialogOpen } = this.state;
    const isSelected = selectedFileIndex !== -1;

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
            <HistoryButton />
            <div style={classes.flex} />
            <div style={{ display: 'inline-block', width: '0.5em' }} />
            <UserLogin/>
          </Toolbar>
        </AppBar>
        <SplitPane split="vertical" defaultSize={250} minSize={0}>
          <SideDrawer />
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

export const JumboContentDefault  = JumboContent;
