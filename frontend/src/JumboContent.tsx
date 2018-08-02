import * as React from 'react';
import SplitPane from 'react-split-pane';
import CanvasOutput from './components/CanvasOutput';
import OutputPanel from './OutputPanel';
import 'static/styles/SplitPane.css';
import red from '@material-ui/core/colors/red';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import PlayIcon from '@material-ui/icons/PlayArrow';
import CodeEditor from './containers/CodeEditor';
import ExploreIcon from '@material-ui/icons/Explore';
import Button from '@material-ui/core/Button';
import StopIcon from '@material-ui/icons/Stop';
import { RootState } from './store';
import { getSelectedFileName } from './store/userFiles/selectors';
import { AsyncRun } from 'stopify';
import { connect } from 'react-redux';
import * as stopify from 'stopify';
import * as elementaryJS from 'elementary-js';
import { saveHistory } from './utils/api/saveHistory'
import { isFailureResponse } from './utils/api/apiHelpers';
import { setGlobals } from './runner';

// TODO(arjun): I think these hacks are necessary for eval to work. We either 
// do them here or we do them within the implementation of Stopify. I want 
// them here for now until I'm certain there isn't a cleaner way.
import * as elementaryRTS from 'elementary-js/dist/runtime';
(window as any).stopify = stopify;
(window as any).elementaryjs = elementaryRTS;

const redTheme = createMuiTheme({
    palette: {
        primary: red,
    }
});

type State = {
    asyncRunner: AsyncRun | undefined,
    status: 'running' | 'testing' | 'stopped',
    code: string
}

type Props = {
    filename: string,
    loggedIn: boolean
}

class JumboContent extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = { 
            asyncRunner: undefined,
            status: 'stopped',
            code: ''
        };
    }

    handleStopifyResult = (result: stopify.Result) => {
        if (result.type === 'exception') {
            // tslint:disable-next-line:no-console
            console.error(result.value, result.stack[0]);
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
        const compiled = elementaryJS.compile(this.state.code, {
            isOnline: true,
            runTests: mode === 'testing',
        });
        if (compiled.kind === 'error') {
            for (const err of compiled.errors) {
                console.error(`Line ${err.location.start.line}: ${err.message}`);
            }
            return;
        }
        if (window.location.hostname === 'localhost') {
            window.localStorage.setItem('code', this.state.code);
        }
        
        try {
            const runner = stopify.stopifyLocallyFromAst(compiled.node);
            setGlobals((runner as any).g);
            this.setState({ asyncRunner: runner, status: mode });
            (window as any).lib220.setRunner(runner);
            runner.run((result: any) => {
                // tslint:disable-next-line:no-console
                // console.log(result);
                this.handleStopifyResult(result);
                this.setState({ asyncRunner: undefined, status: 'stopped' });
            });
        } catch (e) {
            if (e instanceof elementaryRTS.ElementaryRuntimeError) {
                // Don't report stack traces. Count on ElementaryJS to report
                // line numbers.
                console.error(e.message);this.state
            }
            else {
                // tslint:disable-next-line:no-console
                console.error(e);
            }
        }    
    }

    onStop() {
        const asyncRun = this.state.asyncRunner;
        if (typeof asyncRun === 'undefined') {
            // UI glitch. Is this possible?
            return;
        }
        asyncRun.pause((line?: number) => {
            // NOTE: We do *not* remove the asyncRun object. This will allow
            // a user to continue mucking around in the console after killing a 
            // running program.
            this.setState({ status: 'stopped' });
        });
    }

    render() {
      return (
        <SplitPane split="horizontal" minSize={48} defaultSize="25%"
                   primary="second">
            <SplitPane
                split="vertical"
                defaultSize="50%"
                minSize={0}
                pane1Style={{maxWidth: '100%'}}>
                <div style={{ width: '100%', height: '100%' }}>
                    <Button color="secondary" 
                            onClick={() => this.onRun('running')}
                            disabled={this.state.status !== 'stopped'}>
                      <PlayIcon color="inherit" />
                      Run
                    </Button>
                    <Button color="secondary" 
                            onClick={() => this.onRun('testing')}
                            disabled={this.state.status !== 'stopped'}>
                      <ExploreIcon color="inherit" />
                      Test
                    </Button>
                    <MuiThemeProvider theme={redTheme}>
                        <Button color="secondary" 
                                onClick={() => this.onStop()}
                                disabled={this.state.status === 'stopped'}>
                        <StopIcon color="inherit" />
                        Stop
                        </Button>
                    </MuiThemeProvider>

                    <CodeEditor updateCode={(code) => this.updateCode(code)}/>
                </div>

                <CanvasOutput />
            </SplitPane>
            <OutputPanel runner={this.state.asyncRunner} />
      </SplitPane>);
    }

}

const mapStateToProps = (state: RootState) => ({
    filename: getSelectedFileName(state),
    loggedIn: state.userLogin.loggedIn
});

export default connect(mapStateToProps)(JumboContent);
