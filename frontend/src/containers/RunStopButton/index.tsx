import * as React from 'react';
import Button from '@material-ui/core/Button';
import red from '@material-ui/core/colors/red';
import { WithStyles, withStyles, StyleRulesCallback, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { RootState } from '../../store';
import { Dispatch } from 'redux';
import { setCodeRunner, removeCodeRunner } from '../../store/codeEditor/actions';
import { connect } from 'react-redux';
import { getSelectedCode } from '../../store/userFiles/selectors';
import PlayIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';

import * as elementaryJS from 'elementary-js';
import * as stopify from 'stopify';

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

const tempTheme = createMuiTheme({
    palette: {
        primary: red,
    }
});

type Props = WithStyles<'button' | 'leftIcon'> & {
    codeRunner: any,
    code: string,
    enabled: boolean,
    setRunnerToState: (runner: any) => void,
    removeRunnerFromState: () => void,
};

class RunStopButton extends React.Component<Props> {

    handleStopifyResult = (result: stopify.Result) => {
        if (result.type === 'exception') {
            // tslint:disable-next-line:no-console
            console.error(result.value, result.stack[0]);
        }
    }

    onRun = () => {
        const compiled = elementaryJS.compile(this.props.code, true);
        if (compiled.kind === 'error') {
            for (const err of compiled.errors) {
              console.error(`Line ${err.location.start.line}: ${err.message}`);
            }
            return;
        }
        try {
            const runner = stopify.stopifyLocallyFromAst(
                compiled.node,
                undefined, // TODO(arjun): will need to specify for error locs.
                {
                    externals: [
                        'elementaryjs',
                        'console',
                        'lib220'
                    ]
                },
                {
                    // estimator: 'countdown',
                    // yieldInterval: 1
                }
            );
            this.props.setRunnerToState(runner);
            runner.run((result: any) => {
                // tslint:disable-next-line:no-console
                // console.log(result);
                this.handleStopifyResult(result);
                this.props.removeRunnerFromState();
            });
        } catch (e) {
            // tslint:disable-next-line:no-console
            console.error(e);
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
        const runnerExists = codeRunner === undefined;
        return (
            <div style={{display: 'inline-block', width: '108px'}}>
                <Button
                    style={runnerExists ? {} : { display: 'none' }}
                    color="secondary"
                    className={classes.button}
                    onClick={this.onRun}
                    disabled={!enabled}
                >

                    <PlayIcon color="inherit" className={classes.leftIcon} />
                    Run
                </Button>
                <MuiThemeProvider theme={tempTheme}>
                    <Button
                        style={runnerExists ? { display: 'none' } : {}}
                        color="primary"
                        className={classes.button}
                        onClick={this.onStop}
                    >

                        <StopIcon color="inherit" className={classes.leftIcon} />
                        Stop
                    </Button>
                </MuiThemeProvider>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    codeRunner: state.codeEditor.codeRunner,
    code: getSelectedCode(state),
    enabled: typeof state.codeEditor.testRunner === 'undefined'
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setRunnerToState: (runner: any) => { dispatch(setCodeRunner(runner)); },
    removeRunnerFromState: () => { dispatch(removeCodeRunner()); }
});

const styling = withStyles(styles);

export default connect(mapStateToProps, mapDispatchToProps)(styling(RunStopButton));