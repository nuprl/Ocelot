import * as React from 'react';
import Button from '@material-ui/core/Button';
import red from '@material-ui/core/colors/red';
import { WithStyles, withStyles, StyleRulesCallback, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { RootState } from './store';
import { Dispatch } from 'redux';
import { setCodeRunner, removeCodeRunner } from './store/codeEditor/actions';
import { connect } from 'react-redux';
import { getSelectedCode, getSelectedFileName } from './store/userFiles/selectors';
import PlayIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import { isFailureResponse } from './utils/api/apiHelpers';
import { saveHistory } from './utils/api/saveHistory'
import { AsyncRun } from 'stopify';

import * as elementaryJS from 'elementary-js';
import * as stopify from 'stopify';
import { setGlobals } from './runner';

// TODO(arjun): I think these hacks are necessary for eval to work. We either 
// do them here or we do them within the implementation of Stopify. I want 
// them here for now until I'm certain there isn't a cleaner way.
import * as elementaryRTS from 'elementary-js/dist/runtime';
(window as any).stopify = stopify;
(window as any).elementaryjs = elementaryRTS;

const styles: StyleRulesCallback = theme => ({
    button: {
        margin: theme.spacing.unit * 0.5,
    },
    leftIcon: {
        marginRight: theme.spacing.unit,
    }
});

const redTheme = createMuiTheme({
    palette: {
        primary: red,
    }
});

type Props = WithStyles<'button' | 'leftIcon'> & {
    codeRunner: any,
    code: string,
    enabled: boolean,
    fileName: string,
    loggedIn: boolean,
    setRunnerToState: (runner: any) => void,
    removeRunnerFromState: () => void,
    setRunner: (runner: AsyncRun) => void
};

class RunButton extends React.Component<Props> {

    handleStopifyResult = (result: stopify.Result) => {
        if (result.type === 'exception') {
            // tslint:disable-next-line:no-console
            console.error(result.value, result.stack[0]);
        }
    }

    onRun = () => {
        if (this.props.loggedIn) {
            saveHistory(this.props.fileName, this.props.code).then((res) => {
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
        const compiled = elementaryJS.compile(this.props.code, {
            isOnline: true,
            runTests: false,
        });
        if (compiled.kind === 'error') {
            for (const err of compiled.errors) {
                console.error(`Line ${err.location.start.line}: ${err.message}`);
            }
            return;
        }
        if (window.location.hostname === 'localhost') {
            window.localStorage.setItem('code', this.props.code);
        }

        try {
            const runner = stopify.stopifyLocallyFromAst(compiled.node);
            setGlobals((runner as any).g);
            this.props.setRunner(runner);
            this.props.setRunnerToState(runner);
            (window as any).lib220.setRunner(runner);
            runner.run((result: any) => {
                // tslint:disable-next-line:no-console
                // console.log(result);
                this.handleStopifyResult(result);
                this.props.removeRunnerFromState();
            });
        } catch (e) {
            if (e instanceof elementaryRTS.ElementaryRuntimeError) {
                // Don't report stack traces. Count on ElementaryJS to report
                // line numbers.
                console.error(e.message);
            }
            else {
                // tslint:disable-next-line:no-console
                console.error(e);
            }
        }

    }

    onStop = () => {
        if (typeof this.props.codeRunner === 'undefined') {
            return;
        }
        this.props.codeRunner.pause((line?: number) => {
            // tslint:disable-next-line:no-console
            console.log('stopped');
            this.props.removeRunnerFromState();
        });

    }

    render() {
        const { classes, codeRunner, enabled } = this.props;
        const runnerExists = codeRunner !== undefined;
        let currentButton = (
            <Button
                color="secondary"
                className={classes.button}
                onClick={this.onRun}
                disabled={!enabled}
            >
                <PlayIcon color="inherit" className={classes.leftIcon} />
                Run
            </Button>
        );
        if (runnerExists) {
            currentButton = (
                <MuiThemeProvider theme={redTheme}>
                    <Button
                        color="primary"
                        className={classes.button}
                        onClick={this.onStop}
                    >

                        <StopIcon color="inherit" className={classes.leftIcon} />
                        Stop
                    </Button>
                </MuiThemeProvider>
            );
        }
        return (
            <div style={{ display: 'inline-block', width: '108px' }}>
                {currentButton}
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    codeRunner: state.codeEditor.codeRunner,
    code: getSelectedCode(state),
    enabled: typeof state.codeEditor.testRunner === 'undefined',
    fileName: getSelectedFileName(state),
    loggedIn: state.userLogin.loggedIn
    
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setRunnerToState: (runner: any) => { dispatch(setCodeRunner(runner)); },
    removeRunnerFromState: () => { dispatch(removeCodeRunner()); }
});

const styling = withStyles(styles);

export default connect(mapStateToProps, mapDispatchToProps)(styling(RunButton));