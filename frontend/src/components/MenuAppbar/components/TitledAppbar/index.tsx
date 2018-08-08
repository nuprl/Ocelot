import * as React from 'react';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import PawIcon from '@material-ui/icons/Pets';
import RunIcon from '@material-ui/icons/PlayArrow';
import TestIcon from '@material-ui/icons/Explore';
import Button from '@material-ui/core/Button';
import FileIcon from '@material-ui/icons/FileCopy';
import StopIcon from '@material-ui/icons/Stop';
import CanvasIcon from '@material-ui/icons/Wallpaper';
import ConsoleIcon from '@material-ui/icons/NavigateNext';

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
                <Typography
                    variant="subheading"
                    color="inherit"
                    classes={{
                        subheading: classes.title,
                    }}
                    noWrap
                >
                    {title}
                </Typography>
                <div style={{width: 50}} />
                <Button
                        color="secondary"
                        onClick={() => console.log("Clicked files")}>
                    <FileIcon />
                    Files
                </Button>
                <Button
                        color="secondary"
                        onClick={() => console.log("Clicked run")}>
                    <RunIcon />
                    Run
                </Button>
                <Button
                        color="secondary"
                        onClick={() => console.log("Clicked test")}>
                    <TestIcon />
                    Test
                </Button>
                <Button
                        color="secondary"
                        onClick={() => console.log("Clicked stop")}>
                    <StopIcon />
                    Stop
                </Button>
                <Button
                        color="secondary"
                        onClick={() => console.log("Clicked console")}>
                    <ConsoleIcon />
                    Console
                </Button>
                <Button
                        color="secondary"
                        onClick={() => console.log("Clicked canvas")}>
                    <CanvasIcon />
                    Canvas
                </Button>
                <div className={classes.flex} />
                {children}
            </Toolbar>
        </AppBar>
    );
};

export default withStyles(styles)(TitledAppbar);