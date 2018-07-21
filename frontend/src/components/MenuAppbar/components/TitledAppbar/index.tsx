import * as React from 'react';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Fade from '@material-ui/core/Fade';
import { PlayStopIcon } from 'components/PlayStopIcon';

let appBarConstrastText: string = '#fff';

const styles: StyleRulesCallback = theme => {
    appBarConstrastText = theme.palette.primary.contrastText;
    return {
        flex: {
            flex: 1,
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

type TitledAppbarProps = {
    title: string, // the title of the appbar
};

const TitledAppbar: React.StatelessComponent<WithStyles<string> & TitledAppbarProps> = (props) => {
    const { classes, children, title } = props;
    return (
        <AppBar position="absolute">
            <Toolbar>
                {/* Todo: Do not use PlayStopIcon, use some other icon */}
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
                        {title}
                    </Typography>
                </Fade>
                {children}
            </Toolbar>
        </AppBar>
    );
};

export default withStyles(styles)(TitledAppbar);