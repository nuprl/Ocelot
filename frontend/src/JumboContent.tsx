import * as React from 'react';
import SplitPane from 'react-split-pane';
import CanvasOutput from './components/CanvasOutput';
import OutputPanel from './OutputPanel';
import './static/styles/SplitPane.css';
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
import SideDrawer from './SideDrawer';
import { OfflineIndicator } from './offlineIndicator';
import Notification from './containers/Notification';
import * as sandbox from './sandbox';
import UserLogin from './loginButton';
import HistoryButton from './containers/HistoryButton';
import * as state from './state';
import * as reactrx from './reactrx';
import './autosave';
import { console } from './errors';

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
  },
  overrides: {
    MuiButton : {
      root: {
        paddingLeft: '8px',
        paddingRight: '8px',
        minWidth: '0px',
      }
    }
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

type ExecutionButtonsState = {
  mode : sandbox.Mode,
  uiActive: boolean,
  currentProgram: state.Program
}

class ExecutionButtons extends React.Component<ExecutionProps, ExecutionButtonsState> {

  constructor(props: ExecutionProps) {
    super(props);
    this.state = { 
      mode: this.props.sandbox.mode.getValue(),
      uiActive: state.uiActive.getValue(),
      currentProgram: state.currentProgram.getValue()
    };
    reactrx.connect(this, 'uiActive', state.uiActive);
    reactrx.connect(this, 'mode', this.props.sandbox.mode);
    reactrx.connect(this, 'currentProgram', state.currentProgram);
  }

  onRunOrTestClicked(mode: 'running' | 'testing') {
    const program = state.currentProgram.getValue();
    if (this.state.uiActive && program.kind === 'program') {
      saveHistory(program.name, program.content).then((res) => {
        if (isFailureResponse(res)) {
          // Suppress the notification if the browser is offline. Note that
          // we still try to save, even when the UA thinks we are offline.
          // I am not certain that online/offline detection is particularly
          // reliable, so it is not worth disabling saving when offline.
          if (navigator.onLine === false) {
            return;
          }
          state.notify('Failed to save history');
          return;
        }
      })
      .catch(err => console.log(err));
    }
    this.props.sandbox.onRunOrTestClicked(mode);
  }

  render() {
    const { currentProgram, mode } = this.state;
    const mayRun = currentProgram.kind === 'program' && mode === 'stopped';
    const mayStop = (mode === 'running' || mode === 'testing');
    return [
      <Button key="run-button" color="secondary"
        onClick={() => this.onRunOrTestClicked('running')}
        disabled={!mayRun}>
        <PlayIcon color="inherit" />
        <span id="toolbar-buttons-text">
          Run
        </span>
      </Button>,
      <Button key="test-button" color="secondary"
        onClick={() => this.onRunOrTestClicked('testing')}
        disabled={!mayRun}>
        <ExploreIcon color="inherit" />
        <span id="toolbar-buttons-text">
          Test
        </span>
      </Button>,
      <MuiThemeProvider key="stop-button" theme={redTheme}>
        <Button
          color="primary"
          onClick={() => this.props.sandbox.onStopClicked()}
          disabled={!mayStop}>
          <StopIcon color="inherit" />
          <span id="toolbar-buttons-text">
            Stop
          </span>
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


class DownloadButton extends React.Component<{}, { currentProgram: state.Program }> {

  constructor(props: {}) {
    super(props);
    this.state = { currentProgram: state.currentProgram.getValue() };
    reactrx.connect(this, 'currentProgram', state.currentProgram);
  }

  onDownload() {
    const p = state.currentProgram.getValue();
    if (p.kind !== 'program') {
      return;
    }
    let element = document.createElement("a");
    let file = new Blob([p.content], {type: 'application/javascript'});
    element.href = URL.createObjectURL(file);
    element.download = p.name;
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  render() {
    return <Button
      color="secondary"
      disabled={this.state.currentProgram.kind !== 'program'}
      onClick={() => this.onDownload()}>
      <DownloadIcon />
      <span id="toolbar-buttons-text">Download</span>
    </Button>;
  }
}

type JumboContentState = {
  mustLoginDialogOpen: boolean
}
class JumboContent extends React.Component<Props, JumboContentState> {

  private console!: types.HasConsole;
  private sandbox: sandbox.Sandbox;

  constructor(props: Props) {
    super(props);
    this.sandbox = new sandbox.Sandbox();
    this.state = {
      mustLoginDialogOpen: false,
    }
  }
 
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

    const { mustLoginDialogOpen } = this.state;

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
              <span id="toolbar-buttons-text">
                Files
              </span>
            </Button>
            <ExecutionButtons 
              sandbox={this.sandbox} />
            <DownloadButton />
            <Button
              color="secondary"
              onClick={() => this.togglePanel('outputPanel', 'height', '25%', 0)}>
              <ConsoleIcon />
              <span id="toolbar-buttons-text">
                Console
              </span>
            </Button>
            <Button
              color="secondary"
              onClick={() => this.togglePanel('codeEditor', 'width', '50%', '100%')}>
              <CanvasIcon />
              <span id="toolbar-buttons-text">
                Canvas
              </span>
            </Button>
            <HistoryButton />
            <div style={classes.flex} />
            <div style={{ display: 'inline-block', width: '0.5em' }} />
            <OfflineIndicator />
            <UserLogin/>
          </Toolbar>
        </AppBar>
        <SplitPane split="vertical" style={{height:'100%'}} defaultSize={250} minSize={0}>
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
                      sandbox={this.sandbox}
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
