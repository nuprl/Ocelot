import * as React from 'react';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ConsoleInput from './components/ConsoleInput';
import ConsoleOutput from './components/ConsoleOutput';
import { Hook, Decode } from 'console-feed';
import 'static/styles/ConsoleTabs.css';
import { Log } from 'containers/OutputPanel/types';
import ClearButton from 'containers/OutputPanel/components/ClearButton';

const styles: StyleRulesCallback = theme => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.primary.light,
        height: '100%'
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
 * The reason why I stored the state in the component
 * rather than redux is because when users generate lots
 * of logs, redux will slow down. It's very inefficient
 * that redux has to take on the burden to reproduce
 * hundreds/thousands of logs just to create a new state.
 * That's why I have the state stored here so that redux
 * will not need to concern itself with recreating the logs.
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
            this.addNewLog(decodedLog);
        });
    }

    addNewLog = (decodedLog: Log) => {
        this.setState((prevState) => ({ logs: [...prevState.logs, decodedLog] }));
    };

    clearLogs = () => {
        this.setState({ logs: [] });
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
                    <ConsoleInput />
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(OutputPanel);