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
import ListItemStyles from '../../../../components/ListItemStyles';
import { ListItemStylesTypes } from '../../../../components/ListItemStyles';
import { WithStyles } from '@material-ui/core';
import { RootState } from '../../../../store';
import { Dispatch } from 'redux';
import { createNewFile } from '../../../../store/userFiles/actions';
import { UserFiles } from '../../../../store/userFiles/types';
import FormHelperText from '@material-ui/core/FormHelperText';

// this is copied from backend
const isSimpleValidFileName = (fileName: string) => { // still incomplete but will do for now
    return /^\w+\.js/.test(fileName);
};

type Props = {
    newFile: boolean,
    files: UserFiles,
    loggedIn: boolean,
    deleteFileField: () => void,
    onCreateFile: (fileName: string, loggedIn: boolean) => void,
} & WithStyles<ListItemStylesTypes>;

type State = {
    newFileErrorMsg: '' | 'Duplicated file name' | 'File name does not end in .js',
};

class NewFileField extends React.Component<Props, State> {
    listener: (event: KeyboardEvent) => void;
    constructor(props: Props) {
        super(props);
        this.state = {
            newFileErrorMsg: ''
        };
        this.listener = (event) => {
            if (event.keyCode !== 13 || event.target === null) {
                return;
            }
            const name = (event.target as HTMLTextAreaElement).value;
            const result = this.props.files.filter((elem) => elem.name === name);
            if (result.length !== 0) {
                this.setState({ newFileErrorMsg: 'Duplicated file name' });
                return;
            }
            if (!isSimpleValidFileName(name)) {
                this.setState({ newFileErrorMsg: 'File name does not end in .js' });
                return;
            }

            this.props.deleteFileField();
            this.setState({ newFileErrorMsg: '' });
            this.props.onCreateFile(name, this.props.loggedIn);
        };
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.newFile === prevProps.newFile) {
            return;
        }
        let filenameInput = document.getElementById('filename-input');
        if (filenameInput === null || !this.props.newFile) {
            return;
        }
        filenameInput.addEventListener('keyup', this.listener);
    }

    componentWillUnmount() {
        let filenameInput = document.getElementById('filename-input');
        if (filenameInput === null || !this.props.newFile) {
            return;
        }
        filenameInput.removeEventListener('keyup', this.listener);
    }

    render() {
        const { newFile, deleteFileField, classes } = this.props;
        const { newFileErrorMsg } = this.state;

        if (!newFile) {
            return null;
        }

        return (
            <ListItem
                className={`${classes.nested} ${classes.listItemColor}`}
                classes={{ dense: classes.tinyPadding }}
                dense
            >
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
                            error={newFileErrorMsg !== ''}
                        >
                            <Input
                                id="filename-input"
                                classes={{
                                    root: classes.textField
                                }}
                                autoFocus

                            />
                            {
                                newFileErrorMsg !== '' &&
                                <FormHelperText
                                    id="duplicate-error"
                                    margin="dense"
                                >
                                    {newFileErrorMsg}
                                </FormHelperText>
                            }
                        </FormControl>
                    }
                    classes={{ root: classes.listItemColor }}
                />
                <ListItemSecondaryAction
                    className={`${classes.listItemColor}`}
                >
                    <Tooltip
                        disableFocusListener
                        disableTouchListener
                        id="tooltip-icon"
                        title="Delete"
                        classes={{
                            tooltipPlacementBottom: classes.closerTooltip
                        }}
                    >
                        <IconButton
                            aria-label="delete"
                            color="inherit"
                            className={`${classes.listItemColor}`}
                            onClick={deleteFileField}
                            classes={{ root: classes.noButtonBackground }}
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
    // wantNewFile: state.userFiles.filesInfo.newFile,
    files: state.userFiles.filesInfo.files,
    // newFileError: state.userFiles.filesInfo.newFileError,
    loggedIn: state.userLogin.loggedIn
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    onCreateFile: (fileName: string, loggedIn: boolean) => {
        dispatch(createNewFile(fileName, loggedIn));
        // dispatch(deleteNewFileField());
    },
    // notifyError: () => {
    //     dispatch(triggerNewFileError());
    // }
});

export default connect(mapStateToProps, mapDispatchToProps)(ListItemStyles(NewFileField));