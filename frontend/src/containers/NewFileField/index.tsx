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
import { Dispatch } from 'react-redux';
import { deleteNewFileField, createNewFile } from 'store/userFiles/actions';
import { UserFiles } from 'store/userFiles/types';
import { batchActions } from 'store/batchActions';

type Props = {
    wantNewFile: boolean,
    deleteFileField: () => void,
    onCreateFile: (fileName: string) => void,
    files: UserFiles
}
    & WithStyles<ListItemStylesTypes>;

class NewFileField extends React.Component<Props> {

    componentDidUpdate(prevProps: Props) {
        if (this.props.wantNewFile === prevProps.wantNewFile) {
            return;
        }
        let filenameInput = document.getElementById('filename-input');
        if (filenameInput === null || !this.props.wantNewFile) {
            return;
        }
        filenameInput.addEventListener('keyup', (event) => {
            if (event.keyCode !== 13 || event.target === null) {
                return;
            }
            const name = (event.target as HTMLTextAreaElement).value;
            const result = this.props.files.filter((elem) => elem.name === name);
            if (result.length !== 0) {
                // maybe set a state to show an error because of file with same name exists
                // highlight text field in red
                return;
            }
            this.props.onCreateFile(name);
        });
    }

    render() {
        const { wantNewFile, deleteFileField, classes } = this.props;

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
                        >
                            <Input
                                id="filename-input"
                                classes={{
                                    root: classes.textField
                                }}
                                autoFocus
                                
                            />
                        </FormControl>}
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
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    deleteFileField: () => { dispatch(deleteNewFileField()); },
    onCreateFile: (fileName: string) => {
        dispatch(
            batchActions(
                createNewFile(fileName),
                deleteNewFileField(),
            )
        );
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(ListItemStyles(NewFileField));