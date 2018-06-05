import * as React from 'react';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import LoginButton from './LoginButton';
import EjectIcon from '@material-ui/icons/Eject';
import Fade from '@material-ui/core/Fade';

const styles: StyleRulesCallback = theme => ({
    flex: {
        flex: 1,
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    ejectIcon: {
        transform: 'rotate(90deg) !important',
        margin: theme.spacing.unit
    }
});

type MenuAppbarProps = {
    onLogin: () => void;
    onLogout: () => void;
};

class MenuAppbar extends React.Component<WithStyles<string> & MenuAppbarProps> {

    render() {
        const { classes, onLogin, onLogout } = this.props;

        return (
            <AppBar position="absolute" className={classes.appBar}>
                <Toolbar>
                    <Fade in={true} timeout={300}>
                        <EjectIcon className={classes.ejectIcon} />
                    </Fade>
                    {/* Not quite satisfied with these animations, kind of want rotation/slide and fade combined */}
                    <Fade in={true} timeout={700} >
                        <Typography variant="subheading" color="inherit" className={classes.flex} noWrap>
                            PAWS
                            </Typography>
                    </Fade>

                    <LoginButton onLogin={onLogin} onLogout={onLogout} />
                </Toolbar>
            </AppBar>
        );
    }
}

export default withStyles(styles)(MenuAppbar);