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
    handleClose: (event: React.SyntheticEvent<any>, reason: string) => void,
    handleClick: (event: React.MouseEvent<HTMLElement>) => void,
    message: string
};
function ErrorSnackbar(props: WithStyles<'close'> & ErrorSnackbarProps) {
    return (
        <Snackbar
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            open={props.open}
            autoHideDuration={5000}
            onClose={props.handleClose}
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
                    onClick={props.handleClick}
                >
                    <CloseIcon color="secondary"/>
                </IconButton>,
            ]}
        />
    );
}

export default withStyles(styles)(ErrorSnackbar);