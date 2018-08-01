import * as React from 'react';
import Button from '@material-ui/core/Button';
import red from '@material-ui/core/colors/red';
import { WithStyles, withStyles, StyleRulesCallback, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { RootState } from '../../store';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { setTestRunner, removeTestRunner } from '../../store/codeEditor/actions';
import { getSelectedCode, getSelectedFileName } from '../../store/userFiles/selectors';
import ExploreIcon from '@material-ui/icons/Explore';
import ExploreOffIcon from '@material-ui/icons/ExploreOff';
import { saveHistory } from '../../utils/api/saveHistory'
import { isFailureResponse } from '../../utils/api/apiHelpers';
import { setGlobals } from '../runner';

import * as elementaryJS from 'elementary-js';
import * as elementaryRTS from 'elementary-js/dist/runtime';
import * as stopify from 'stopify';

(window as any).elementaryjs = elementaryRTS;

type StopifyResult = {
    type: string,
    value: Error,
    stack: string[]
};

const styles: StyleRulesCallback = theme => ({
    button: {
        margin: theme.spacing.unit * 0.5,
        marginLeft: 0,
    },
    leftIcon: {
        marginRight: theme.spacing.unit,
    }
});

const greenTheme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: {
            main: '#2ac093'
        },
    }
});

const redTheme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: red
    }
});

type Props = WithStyles<'button' | 'leftIcon'> & {
    testRunner: any,
    code: string,
    enabled: boolean,
    fileName: string,
    loggedIn: boolean,
    setRunnerToState: (runner: any) => void,
    removeRunnerFromState: () => void,
};
// Test button and run button is very copypasta code
// we need a more general component to wrap TestButton and RunStopButton
class TestButton extends React.Component<Props> {

    handleStopifyResult = (result: StopifyResult) => {
        if (result.type === 'exception') {
            // tslint:disable-next-line:no-console
            console.error(result.value, result.stack[0]);
        }
    }

    onRun = () => {
        try {
            if (window.location.hostname === 'localhost') {
                window.localStorage.setItem('code', this.props.code);
            }
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
                runTests: true,
            });

            if (compiled.kind === 'error') {
                for (const err of compiled.errors) {
                    console.error(`Line ${err.location.start.line}: ${err.message}`);
                }
                return;
            }
            // tslint:disable-next-line:no-console
            // console.log(compile(this.props.code));
            const runner = stopify.stopifyLocallyFromAst(
                compiled.node);
            setGlobals((runner as any).g);
            this.props.setRunnerToState(runner);
            runner.run((result: any) => {
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
        if (typeof this.props.testRunner === 'undefined') {
            return;
        }
        this.props.testRunner.pause((line?: number) => {
            // tslint:disable-next-line:no-console
            console.log('stopped');
            this.props.removeRunnerFromState();
        });

    }

    render() {
        const { classes, testRunner, enabled } = this.props;
        const runnerExists = testRunner !== undefined;
        let currentButton = (
            <MuiThemeProvider theme={greenTheme}>
                <Button
                    color="primary"
                    className={classes.button}
                    onClick={this.onRun}
                    disabled={!enabled}
                >

                    <ExploreIcon color="inherit" className={classes.leftIcon} />
                    Test
                    </Button>
            </MuiThemeProvider>
        );
        if (runnerExists) {
            currentButton = (
                <MuiThemeProvider theme={redTheme}>
                    <Button
                        color="primary"
                        className={classes.button}
                        onClick={this.onStop}
                    >

                        <ExploreOffIcon color="inherit" className={classes.leftIcon} />
                        Test
                    </Button>
                </MuiThemeProvider>
            );
        }
        return (
            <div style={{ display: 'inline-block' }}>
                {currentButton}
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    testRunner: state.codeEditor.testRunner,
    code: getSelectedCode(state),
    enabled: typeof state.codeEditor.codeRunner === 'undefined',
    fileName: getSelectedFileName(state),
    loggedIn: state.userLogin.loggedIn
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setRunnerToState: (runner: any) => { dispatch(setTestRunner(runner)); },
    removeRunnerFromState: () => { dispatch(removeTestRunner()); }
});

const styling = withStyles(styles);

export default connect(mapStateToProps, mapDispatchToProps)(styling(TestButton));