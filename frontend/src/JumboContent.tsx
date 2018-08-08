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
import { AsyncRun } from 'stopify';
import { connect } from 'react-redux';
import * as stopify from 'stopify';
import * as elementaryJS from 'elementary-js';
import { saveHistory } from './utils/api/saveHistory'
import { isFailureResponse } from './utils/api/apiHelpers';
import { setGlobals } from './runner';
import SideDrawer from './components/SideDrawer';
import Notification from './containers/Notification';

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

import * as lib220 from 'elementary-js/dist/lib220';

// TODO(arjun): I think these hacks are necessary for eval to work. We either 
// do them here or we do them within the implementation of Stopify. I want 
// them here for now until I'm certain there isn't a cleaner way.
import * as elementaryRTS from 'elementary-js/dist/runtime';
(window as any).stopify = stopify;
(window as any).elementaryjs = elementaryRTS;


const classes =  {
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

type State = {
    asyncRunner: AsyncRun | undefined,
    status: 'running' | 'testing' | 'stopped' | 'pausing',
    code: string
}

type Props = {
    filename: string,
    loggedIn: boolean,
    fileIndex: number,
    classes: {root:string,
         jumboContent:string, 
         toolbar:string, 
         jumboContainer:string},
}

class JumboContent extends React.Component<Props, State> {

    private hasConsole: types.HasConsole | undefined;

    constructor(props: Props) {
        super(props);
        this.state = {
            asyncRunner: undefined,
            status: 'stopped',
            code: ''
        };
    }

    recvHasConsole(c: types.HasConsole) {
        this.hasConsole = c;
    }

    handleStopifyResult = (result: stopify.Result) => {
        if (result.type === 'exception') {
            console.error(result);
            if (this.hasConsole) {
                this.hasConsole.appendLogMessage({
                    method: 'error',
                    data: [result.value.message]
                });
                for (let line of result.stack) {
                    this.hasConsole.appendLogMessage({
                        method: 'error',
                        data: [line]
                    });
                }
            }
        }
    }

    setRunner(asyncRunner: AsyncRun) {
        this.setState({ asyncRunner: asyncRunner });
    }

    getRunner(): AsyncRun | undefined {
        return this.state.asyncRunner;
    }

    clearRunner() {
        if (this.state.asyncRunner !== undefined) {
            this.setState({ asyncRunner: undefined });
        }
    }

    updateCode(code: string) {
        this.setState({ code: code });
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        // code may not have to be in .state
        return this.props !== nextProps ||
            this.state.asyncRunner !== nextState.asyncRunner ||
            this.state.status !== nextState.status;
    }

    onRun(mode: 'running' | 'testing') {
        if (this.props.loggedIn) {
            saveHistory(this.props.filename, this.state.code).then((res) => {
                // tslint:disable-next-line:no-console
                if (isFailureResponse(res)) {
                    // tslint:disable-next-line:no-console
                    console.log('Something went wrong');
                    // tslint:disable-next-line:no-console
                    console.log(res.data.message);
                    return;
                }
                // tslint:disable-next-line:no-console
                // console.log('History saved');
            }).catch(err => console.log(err)); // will do for now
        }
        const compiled = elementaryJS.compile(this.state.code, true);
        if (compiled.kind === 'error') {
            for (const err of compiled.errors) {
                // TODO (Sam) : These logs won't go away since the runner is the same
                // Maybe use something else other than the runner or have a type
                // that is ORed with runner and CompileError from elementaryjs
                this.hasConsole && this.hasConsole.appendLogMessage({
                    method: 'error',
                    data: [`Line ${err.line}: ${err.message}`]
                });
            }
            return;
        }
        if (window.location.hostname === 'localhost') {
            window.localStorage.setItem('code', this.state.code);
        }

        try {
            const runner = stopify.stopifyLocallyFromAst(compiled.node);
            setGlobals((runner as any).g);
            elementaryRTS.enableTests(false, runner);
            if (mode === 'testing') {
                elementaryRTS.enableTests(true, runner);
            }
            this.setState({ asyncRunner: runner, status: mode }, () => {
                lib220.setRunner(runner);
                runner.run((result: any) => {
                    // tslint:disable-next-line:no-console
                    // console.log(result);
                    this.handleStopifyResult(result);
                    if (this.state.status === 'testing' && this.hasConsole) {
                        const summary = elementaryRTS.summary(true);
                        this.hasConsole.appendLogMessage({
                            method: 'log',
                            data: [summary.output, ...summary.style]
                        });
                    }
                    this.setState({ status: 'stopped' });
                });
            });
        } catch (e) {
            if (e instanceof elementaryRTS.ElementaryRuntimeError) {
                // Don't report stack traces. Count on ElementaryJS to report
                // line numbers.
                if (this.hasConsole) {
                    this.hasConsole.appendLogMessage({
                        method: 'error',
                        data: [e.message]
                    });
                }
            }
            else {
                // tslint:disable-next-line:no-console
                console.error(e);
            }
        }
    }

    onStop() {
        if (!(this.state.status === 'running' ||
              this.state.status === 'testing')) {
            return;
        }
        const asyncRun = this.state.asyncRunner;
        if (typeof asyncRun === 'undefined') {
            // UI glitch. Is this possible?
            return;
        }
        this.setState({ status: 'pausing' });
        asyncRun.pause((line?: number) => {
            // NOTE: We do *not* remove the asyncRun object. This will allow
            // a user to continue mucking around in the console after killing a 
            // running program.
            this.setState({ status: 'stopped' });
        });
    }

    render() {
        return (
            <div className={this.props.classes.root}>
                <Notification />
                <AppBar position="absolute">
        <Toolbar variant="dense">
            <PawIcon style={classes.icon}/>
            <Typography
                variant="subheading"
                color="inherit"
                noWrap>
                Ocelot
            </Typography>
            <div style={{width: 50}} />
            <Button
                    color="secondary"
                    onClick={() => console.log("Clicked files")}>
                <FileIcon />
                Files
            </Button>
            <Button color="secondary"
                onClick={() => this.onRun('running')}
                disabled={this.state.status !== 'stopped' || this.props.fileIndex === -1}>
                <PlayIcon color="inherit" />
                Run
            </Button>
            <Button color="secondary"
                onClick={() => this.onRun('testing')}
                disabled={this.state.status !== 'stopped' ||  this.props.fileIndex === -1}>
                <ExploreIcon color="inherit" />
                Test
            </Button>
            <MuiThemeProvider theme={redTheme}>
                <Button
                    color="primary"
                    onClick={() => this.onStop()}
                    disabled={(this.state.status === 'stopped' || this.state.status === 'pausing') ||  this.props.fileIndex === -1}>
                    <StopIcon color="inherit" />
                    Stop
            </Button>
            </MuiThemeProvider>
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
                <SplitPane
                  split="vertical"
                  defaultSize={250}
                  minSize={0}
                >
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
                        <CodeEditor updateCode={(code) => this.updateCode(code)}/>
                    </div>
                    <CanvasOutput />
                </SplitPane>
                <OutputPanel runner={this.state.asyncRunner}
                    recvHasConsole={(c) => this.recvHasConsole(c)} />
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

export default connect(mapStateToProps)(JumboContent);
