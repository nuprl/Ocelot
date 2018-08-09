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
import * as types from './types';
import { RootState } from './store';
import { getSelectedFileName, getSelectedFileIndex } from './store/userFiles/selectors';
import { connect } from 'react-redux';
import { saveHistory } from './utils/api/saveHistory'
import { isFailureResponse } from './utils/api/apiHelpers';
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
  filename: string,
  loggedIn: boolean,
  fileIndex: number,
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

class JumboContent extends React.Component<Props, {}> {

  private console!: types.HasConsole;
  private sandbox: sandbox.Sandbox;

  constructor(props: Props) {
    super(props);
    this.sandbox = new sandbox.Sandbox();
  }

  render() {
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
              filename={this.props.filename} 
              loggedIn={this.props.loggedIn}
              sandbox={this.sandbox} />
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
            <HistoryButton />
            <div style={classes.flex} />
            <div style={{ display: 'inline-block', width: '0.5em' }} />
            <UserLogin />
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
                  pane1Style={{ maxWidth: '100%' }}>
                  <div style={{ width: '100%', height: '100%', minWidth: '286px' }}>
                    <CodeEditor updateCode={(code) => this.sandbox.setCode(code)} />
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
  filename: getSelectedFileName(state),
  loggedIn: state.userLogin.loggedIn,
  fileIndex: getSelectedFileIndex(state)
});

export const JumboContentDefault  = connect(mapStateToProps)(JumboContent);
