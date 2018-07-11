import * as React from 'react';
import { connect } from 'react-redux';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import CodeIcon from '@material-ui/icons/Code';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
import Input from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';
import ListItemStyles from 'components/ListItemStyles';
import { ListItemStylesTypes } from 'components/ListItemStyles';
import { WithStyles } from '@material-ui/core';
import { RootState } from 'store';
import { Dispatch } from 'redux';
import { deleteNewFileField, createNewFile, triggerNewFileError } from 'store/userFiles/actions';
import { UserFiles } from 'store/userFiles/types';
import FormHelperText from '@material-ui/core/FormHelperText';

// this is copied from backend
const isSimpleValidFileName = (fileName: string) => { // still incomplete but will do for now
    return /^\w+\.js/.test(fileName);
};

type Props = {
    wantNewFile: boolean,
    files: UserFiles,
    newFileError: boolean,
    loggedIn: boolean,
    deleteFileField: () => void,
    onCreateFile: (fileName: string, loggedIn: boolean) => void,
    notifyError: () => void,
} & WithStyles<ListItemStylesTypes>;

class NewFileField extends React.Component<Props> {
    listener: (event: KeyboardEvent) => void;
    constructor(props: Props) {
        super(props);
        this.listener = (event) => {
            if (event.keyCode !== 13 || event.target === null) {
                return;
            }
            const name = (event.target as HTMLTextAreaElement).value;
            const result = this.props.files.filter((elem) => elem.name === name);
            if (result.length !== 0 || !isSimpleValidFileName(name)) {
                this.props.notifyError();
                return;
            }
            this.props.onCreateFile(name, this.props.loggedIn);
        };
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.wantNewFile === prevProps.wantNewFile) {
            return;
        }
        let filenameInput = document.getElementById('filename-input');
        if (filenameInput === null || !this.props.wantNewFile) {
            return;
        }
        filenameInput.addEventListener('keyup', this.listener);
    }

    componentWillUnmount() {
        let filenameInput = document.getElementById('filename-input');
        if (filenameInput === null || !this.props.wantNewFile) {
            return;
        }
        filenameInput.removeEventListener('keyup', this.listener);
    }

    render() {
        const { wantNewFile, deleteFileField, classes, newFileError } = this.props;

        if (!wantNewFile) {
            return null;
        }

        return (
            <ListItem className={`${classes.nested} ${classes.listItemColor}`}>
                <ListItemIcon>
                    <CodeIcon className={classes.listItemColor} />
                </ListItemIcon>
                <ListItemText
                    disableTypography
                    primary={
                        <FormControl
                            className={classes.formControl}
                            aria-describedby="name-helper-text"
                            margin="none"
                            error={newFileError}
                        >
                            <Input
                                id="filename-input"
                                classes={{
                                    root: classes.textField
                                }}
                                autoFocus

                            />
                            {
                                newFileError &&
                                <FormHelperText
                                    id="duplicate-error"
                                    margin="dense"
                                >
                                    Duplicate Filename
                                </FormHelperText>
                            }
                        </FormControl>
                    }
                    classes={{ root: classes.listItemColor }}
                />
                <ListItemSecondaryAction
                    className={`${classes.listItemColor}`}
                >
                    <Tooltip id="tooltip-icon" title="Delete">
                        <IconButton
                            aria-label="delete"
                            color="inherit"
                            className={`${classes.listItemColor}`}
                            onClick={deleteFileField}
                        >
                            <DeleteIcon color="inherit" />
                        </IconButton>
                    </Tooltip>
                </ListItemSecondaryAction>
            </ListItem>

        );
    }
}

const mapStateToProps = (state: RootState) => ({
    wantNewFile: state.userFiles.filesInfo.newFile,
    files: state.userFiles.filesInfo.files,
    newFileError: state.userFiles.filesInfo.newFileError,
    loggedIn: state.userLogin.loggedIn
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    deleteFileField: () => { dispatch(deleteNewFileField()); },
    onCreateFile: (fileName: string, loggedIn: boolean) => {
        dispatch(createNewFile(fileName, loggedIn));
        dispatch(deleteNewFileField());
    },
    notifyError: () => {
        dispatch(triggerNewFileError());
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(ListItemStyles(NewFileField));