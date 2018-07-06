import * as React from 'react';
import Button from '@material-ui/core/Button';
import red from '@material-ui/core/colors/red';
import { WithStyles, withStyles, StyleRulesCallback, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { RootState } from 'store';
import { Dispatch } from 'redux';
import { createCodeRunner, removeCodeRunner } from 'store/codeEditor/actions';
import { connect } from 'react-redux';
import { getSelectedCode } from 'store/userFiles/selectors';
import PlayIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';

declare const stopify: any; // TODO(arjun): we need to fix this

const styles: StyleRulesCallback = theme => ({
    button: {
        margin: theme.spacing.unit,
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
    runner: any,
    code: string,
    createRunner: (runner: any) => void,
    removeRunner: () => void,
};

class RunStopButton extends React.Component<Props> {

    onRun = () => {
        const runner = stopify.stopifyLocally(
            this.props.code,
            {
                externals: ['console']
            },
            {
                estimator: 'countdown',
                yieldInterval: 1
            }
        );
        this.props.createRunner(runner);
        runner.run((result: any) => {
            this.props.removeRunner();
        });
    }

    onStop = () => {
        if (typeof this.props.runner === 'undefined') {
            return;
        }
        this.props.runner.pause((line?: number) => {
            // tslint:disable-next-line:no-console
            // console.log('stopped');
            this.props.removeRunner();
        });

    }

    render() {
        const { classes, runner, } = this.props;
        return (
            <div>
                <Button
                    style={{ display: runner === undefined ? 'inline-flex' : 'none' }}
                    color="secondary"
                    className={classes.button}
                    onClick={this.onRun}
                >

                    <PlayIcon color="inherit" className={classes.leftIcon} />
                    Run
                </Button>
                <MuiThemeProvider theme={tempTheme}>
                    <Button
                        style={{ display: runner === undefined ? 'none' : 'inline-flex' }}
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
    runner: state.codeEditor.runner,
    code: getSelectedCode(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    createRunner: (runner: any) => { dispatch(createCodeRunner(runner)); },
    removeRunner: () => { dispatch(removeCodeRunner()); }
});

const styling = withStyles(styles);

export default connect(mapStateToProps, mapDispatchToProps)(styling(RunStopButton));