import * as React from 'react';
import Button from '@material-ui/core/Button';
import { WithStyles, withStyles, StyleRulesCallback, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { RootState } from 'store';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { setTestRunner, removeTestRunner } from 'store/codeEditor/actions';
import { getSelectedCode } from 'store/userFiles/selectors';
import ExploreIcon from '@material-ui/icons/Explore';
import { celotSymposium, compile } from 'utils/celot';

declare const stopify: any; // TODO(arjun): we need to fix this

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

const tempTheme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: {
            main: '#2ac093'
        },
    }
});

type Props = WithStyles<'button' | 'leftIcon'> & {
    testRunner: any,
    code: string,
    enabled: boolean,
    setRunnerToState: (runner: any) => void,
    removeRunnerFromState: () => void,
};

class TestButton extends React.Component<Props> {

    handleStopifyResult = (result: StopifyResult) => {
        if (result.type === 'exception') {
            // tslint:disable-next-line:no-console
            console.error(result.value, result.stack[0]);
        }
    }

    onRun = () => {
        try {
            // tslint:disable-next-line:no-console
            (window as any).celotSymposium = celotSymposium;

            const runner = stopify.stopifyLocally(
                compile(this.props.code),
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
        const runnerExists = testRunner === undefined;
        return (
            <div style={{ display: 'inline-block' }}>
                <MuiThemeProvider theme={tempTheme}>
                    <Button
                        style={runnerExists ? {} : { display: 'none' }}
                        color="primary"
                        className={classes.button}
                        onClick={this.onRun}
                        disabled={!enabled}
                    >

                        <ExploreIcon color="inherit" className={classes.leftIcon} />
                        Test
                    </Button>
                </MuiThemeProvider>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    testRunner: state.codeEditor.testRunner,
    code: getSelectedCode(state),
    enabled: typeof state.codeEditor.codeRunner === 'undefined'
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setRunnerToState: (runner: any) => { dispatch(setTestRunner(runner)); },
    removeRunnerFromState: () => { dispatch(removeTestRunner()); }
});

const styling = withStyles(styles);

export default connect(mapStateToProps, mapDispatchToProps)(styling(TestButton));