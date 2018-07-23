import * as React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

type Props = {
    open: boolean,
    onClose: () => void,
    hasUrl: (url: string) => void,
};

type State = {
    error: boolean,
    text: string,
};
/**
 * This React component displays an empty state for the canvas section
 * We didn't need this but I wrote it already and I didn't want to throw
 * it away.
 *
 * @class GetUrlDialog
 * @extends {React.Component<Props, State>}
 */
class GetUrlDialog extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            error: false,
            text: '',
        };
    }

    onChange: React.ChangeEventHandler<HTMLInputElement>
        = (event) => {
            this.setState({ text: event.target.value });
        };

    onClose = () => {
        this.props.onClose();
        setTimeout(() => this.setState({error: false, text: ''}), 150);
        // we need setTimeout here because the dialog does not immediately fade out
        // we need it to fade out then set error back to false so that user doesn't
        // see that the text field changed.
    };

    verifyAndSubmit = () => {
        if (this.state.text.length === 0) {
            this.setState({error: true});
            return;
        }
        this.props.hasUrl(this.state.text);
        this.onClose();
    };

    render() {
        const { open } = this.props;
        return (
            <Dialog
                open={open}
                onClose={this.onClose}
                aria-labelledby="form-dialog-title"
                color="primary"
            >
                <DialogTitle id="form-dialog-title">Upload Image</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter a URL of an image to upload to the canvas
                </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        fullWidth
                        onChange={this.onChange}
                        error={this.state.error}
                        helperText={this.state.error ? 'No URL given' : 'Image URL'}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.onClose} color="secondary">
                        Close
                </Button>
                    <Button onClick={this.verifyAndSubmit} color="secondary">
                        Upload
                </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default GetUrlDialog;