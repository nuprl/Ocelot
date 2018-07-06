import * as React from 'react';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ConsoleIO from 'components/ConsoleIO';
import 'static/styles/ConsoleTabs.css';

const styles: StyleRulesCallback = theme => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.primary.light,
        width: '100%',
        height: '100%'
    },
});

type Props = WithStyles<'root'>;

const OutputPanel: React.StatelessComponent<Props> = ({ classes }) => (
    <div className={classes.root}>
        <AppBar position="static" id="tabs">
            <Tabs value={0}>
                <Tab label="Console" />
            </Tabs>
        </AppBar>
        <ConsoleIO />
    </div>
);

export default withStyles(styles)(OutputPanel);