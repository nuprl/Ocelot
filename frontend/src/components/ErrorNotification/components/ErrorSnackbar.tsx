import * as React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';

const styles: StyleRulesCallback = theme => ({
    close: {
        width: theme.spacing.unit * 4,
        height: theme.spacing.unit * 4,
    }
});

type ErrorSnackbarProps = {
    open: boolean,
    handleClose: () => {type: string},
    message: string
};
function ErrorSnackbar(props: WithStyles<'close'> & ErrorSnackbarProps) {
    const handleClose = (event: React.SyntheticEvent<any>, reason: string): void => {
        if (reason === 'clickaway') {
            return;
        }
        props.handleClose();
    }

    const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
        props.handleClose();
    }
    return (
        <Snackbar
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
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
                    <CloseIcon color="secondary" />
                </IconButton>,
            ]}
        />
    );
}

export default withStyles(styles)(ErrorSnackbar);