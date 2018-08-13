import * as React from 'react';
import Snackbar, { SnackbarOrigin } from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import * as state from '../../../state';

// the styles for styling an element with:
// close class i.e. equivalent to .close in css
const styles: StyleRulesCallback = theme => ({
    close: {
        width: theme.spacing.unit * 4,
        height: theme.spacing.unit * 4,
    }
});

type State = {
    open: boolean,
    message: string,
    position: state.NotificationPosition

}

/**
 * A presentational component that shows an Error in the form of a snackbar.
 * It takes in WithStyles and ErrorSnackbarProps as props. WithStyles is for 
 * styling, the actual props are ErrorSnackbarProps
 *
 * @param {(WithStyles<'close'> & ErrorSnackbarProps)} props
 * @returns {React.ComponentType<Snackbar>}
 */
class ErrorSnackbar extends React.Component<WithStyles<'close'>, State> {

    constructor(props: WithStyles<'close'>) {
        super(props);
        this.state = {
            open: false,
            message: '',
            position: 'top'
        };
    }

    componentDidMount() {
        state.notification.subscribe(next => {
            console
            this.setState({
                open: true,
                message: next.message,
                position: next.position
            });
        });
    }

    handleClose(event: React.SyntheticEvent<any>, reason: string): void  {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({ open: false });
    };

    render() {
        const props = this.props;
        
        let anchorOrigin: SnackbarOrigin = {
            vertical: 'top',
            horizontal: 'center',
        };
        if (this.state.position === 'bottom-right') {
            anchorOrigin = { vertical: 'bottom', horizontal: 'right' };
        }
    
        return (
            <Snackbar
                anchorOrigin={anchorOrigin}
                open={this.state.open}
                autoHideDuration={5000}
                onClose={(event, reason) => this.handleClose(event, reason)}
                ContentProps={{
                    'aria-describedby': 'message-id',
                }}
                message={<span id="message-id">{this.state.message}</span>}
                action={[
                    <IconButton
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        className={props.classes.close}
                        onClick={() => this.setState({ open: false })}>
                        <CloseIcon color="secondary" />
                    </IconButton>,
                ]}
            />
        );
    }
}

export default withStyles(styles)(ErrorSnackbar);