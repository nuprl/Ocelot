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
import { celotSymposium } from '../../utils/celot';
import { isFailureResponse } from '../../utils/api/apiHelpers';

import * as elementaryJS from 'elementary-js';
import * as stopify from 'stopify';

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
            // tslint:disable-next-line:no-console
            (window as any).celotSymposium = celotSymposium;
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
                compiled.node,
                undefined, // TODO(arjun): will need to specify for error locs.
                {
                    externals: [
                        'console',
                        'celotSymposium',
                        'contendEqual',
                        'contendNotEqual'
                    ]
                },
                {
                    // estimator: 'countdown',
                    // yieldInterval: 1
                }
            );
            this.props.setRunnerToState(runner);
            runner.run((result: any) => {
                this.handleStopifyResult(result);
                this.props.removeRunnerFromState();
            });
        } catch (e) {
            // tslint:disable-next-line:no-console
            console.error(e);
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