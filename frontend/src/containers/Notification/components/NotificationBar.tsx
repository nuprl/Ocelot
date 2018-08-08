import * as React from 'react';
import Snackbar, { SnackbarOrigin } from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import { NotificationPosition } from '../../../store/notification/types';

// -- A presentational component

// the styles for styling an element with:
// close class i.e. equivalent to .close in css
const styles: StyleRulesCallback = theme => ({
    close: {
        width: theme.spacing.unit * 4,
        height: theme.spacing.unit * 4,
    }
});

type ErrorSnackbarProps = {
    open: boolean, // whether the notification is open
    message: string, // the message of notification
    position: NotificationPosition
    handleClose: () => void, // let snackbar close when it needs to
};

/**
 * A presentational component that shows an Error in the form of a snackbar.
 * It takes in WithStyles and ErrorSnackbarProps as props. WithStyles is for 
 * styling, the actual props are ErrorSnackbarProps
 *
 * @param {(WithStyles<'close'> & ErrorSnackbarProps)} props
 * @returns {React.ComponentType<Snackbar>}
 */
function ErrorSnackbar(props: WithStyles<'close'> & ErrorSnackbarProps) {
    const handleClose = (event: React.SyntheticEvent<any>, reason: string): void => {
        if (reason === 'clickaway') {
            return;
        }
        props.handleClose();
    };

    const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
        props.handleClose();
    };
    
    let anchorOrigin: SnackbarOrigin = {
        vertical: 'top',
        horizontal: 'center',
    };
    if (props.position === 'bottom-right') {
        anchorOrigin = {
            vertical: 'bottom',
            horizontal: 'right',
        };
    }

    return (
        <Snackbar
            anchorOrigin={anchorOrigin}
            open={props.open}
            autoHideDuration={5000}
            onClose={handleClose}
            ContentProps={{
                'aria-describedby': 'message-id',
            }}
            message={<span id="message-id">{props.message}</span>}
            action={[
                <IconButton
                    key="close"
                    aria-label="Close"
                    color="inherit"
                    className={props.classes.close}
                    onClick={handleClick}
                >
                    <CloseIcon color="action" />
                </IconButton>,
            ]}
        />
    );
}

export default withStyles(styles)(ErrorSnackbar);