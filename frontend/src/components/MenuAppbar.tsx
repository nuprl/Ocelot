import * as React from 'react';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import LoginButton from './LoginButton';

const styles: StyleRulesCallback = theme => ({
    root: {
        flexGrow: 0,
    },
    flex: {
        flex: 1,
    }
});

function MenuAppbar(props: WithStyles<'root'|'flex'>) {
    const { classes } = props;

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="title" color="inherit" className={classes.flex} noWrap>
                        CS 220 Paws
                    </Typography>
                    <LoginButton />
                </Toolbar>
            </AppBar>
        </div>
    );
}

export default withStyles(styles)(MenuAppbar);