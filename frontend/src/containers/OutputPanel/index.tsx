import * as React from 'react';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ConsoleInput from './components/ConsoleInput';
import ConsoleOutput from './components/ConsoleOutput';
import { Hook, Decode } from 'console-feed';
import 'static/styles/ConsoleTabs.css';
import { Log } from './types';
import ClearButton from './components/ClearButton';

const styles: StyleRulesCallback = theme => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.primary.light,
        height: '100%',
        width: '100%'
    },
});

const EmptyDiv: React.StatelessComponent = () => (
    <div style={{ flex: 1 }} />
);

type Props = WithStyles<'root'>;

type State = {
    logs: Log[],
};
/**
 * OutputPanel component responsible for
 * console output and console input
 * It also has a clear logs button
 * The state is stored here. Maybe I'll 
 * move the state to redux.
 *
 * @class OutputPanel
 * @extends {React.Component<Props, State>}
 */
class OutputPanel extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            logs: []
        };
    }

    componentDidMount() {
        Hook(window.console, (log: any) => {
            const decodedLog = Decode(log);
            if (typeof decodedLog.data !== 'object') {
                this.addNewLog({ data: ['Console was cleared'], method: 'info' });
                return;
            }
            this.addNewLog(decodedLog);
        });
    }

    addNewLog = (decodedLog: Log) => {
        this.setState((prevState) => ({ logs: [...prevState.logs, decodedLog] }));
    };

    clearLogs = () => {
        this.setState({ logs: [] });
        console.clear();
    };

    addNewCommandResult = (command: string, result: any, isError: boolean) => {
        this.setState((prevState) => ({
            logs: [...prevState.logs,
            { method: 'command', data: [command] },
            { method: isError ? 'error' : 'result', data: [result] }
            ]
        }));
    };

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <AppBar position="static" id="tabs">
                    <Tabs value={0}>
                        <Tab label="Console" />
                        <EmptyDiv />
                        <ClearButton onClick={this.clearLogs} />
                    </Tabs>
                </AppBar>
                <div style={{ height: 'calc(100% - 48px)', flexDirection: 'column', display: 'flex' }}>
                    <ConsoleOutput logs={this.state.logs} />
                    <ConsoleInput onOutput={this.addNewCommandResult}/>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(OutputPanel);