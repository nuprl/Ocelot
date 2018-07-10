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