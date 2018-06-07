import * as React from 'react';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import LoginButton from './LoginButton';
import Fade from '@material-ui/core/Fade';
import { PlayStopIcon } from './PlayStopIcon';

let appBarConstrastText: string = '#fff';

const styles: StyleRulesCallback = theme => {
    appBarConstrastText = theme.palette.primary.contrastText;
    return {
        flex: {
            flex: 1,
        },
        appBar: {
            zIndex: theme.zIndex.drawer + 1,
        },
        playIcon: {
            margin: theme.spacing.unit,
            height: theme.typography.display1.fontSize,
            width: theme.typography.display1.fontSize,
        },
        title: {
            fontFamily: 'Fira Mono, Roboto, Arial, sans-serif',
            fontWeight: 400,
        },
    };
};

type MenuAppbarProps = {
    onLogin: () => void,
    onLogout: () => void,
    createSnackbarError: (message: string) => void,
};

class MenuAppbar extends React.Component<WithStyles<string> & MenuAppbarProps> {

    render() {
        const { classes, onLogin, onLogout, createSnackbarError } = this.props;

        return (
            <AppBar position="absolute" className={classes.appBar}>
                <Toolbar>
                    <PlayStopIcon className={classes.playIcon} color={appBarConstrastText} />
                    <Fade in={true} timeout={700} >
                        <Typography
                            variant="subheading"
                            color="inherit"
                            classes={{
                                subheading: classes.title,
                            }}
                            className={classes.flex}
                            noWrap
                        >
                            PAWS
                        </Typography>
                    </Fade>

                    <LoginButton onLogin={onLogin} onLogout={onLogout} createSnackbarError={createSnackbarError}/>
                </Toolbar>
            </AppBar>
        );
    }
}

export default withStyles(styles)(MenuAppbar);