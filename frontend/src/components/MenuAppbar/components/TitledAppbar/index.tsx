import * as React from 'react';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Fade from '@material-ui/core/Fade';
import PawIcon from '@material-ui/icons/Pets';

const styles: StyleRulesCallback = theme => {
    return {
        flex: {
            flex: 1,
        },
        icon: {
            marginBottom: '0.25em',
            marginRight: theme.spacing.unit * 1.5,
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
            <Toolbar variant="dense">
                <PawIcon className={classes.icon}/>
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