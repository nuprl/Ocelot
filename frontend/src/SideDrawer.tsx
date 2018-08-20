import * as React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import 'static/styles/DrawerIconButton.css';
import 'static/styles/DrawerIconButton.css';
import ListItemStyles from './components/ListItemStyles';
import { ListItemStylesTypes } from './components/ListItemStyles';
import { WithStyles, Button } from '@material-ui/core';
import NewIcon from '@material-ui/icons/Add';
import Typography from '@material-ui/core/Typography';
import * as state from './state';
import 'static/styles/DrawerIconButton.css';
import * as Rx from 'rxjs';
import { saveChanges } from './utils/api/saveFileChanges';
import { isFailureResponse } from './utils/api/apiHelpers';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import CodeIcon from '@material-ui/icons/Code';
import CustomListItemText from './components/ItemTypography';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
import ListItemText from '@material-ui/core/ListItemText';
import Input from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Drawer from '@material-ui/core/Drawer';
import { StyleRulesCallback, withStyles } from '@material-ui/core/styles';

// NOTE (Sam): If you make any changes for isSimpleValidFileName
// You have to do the same for the backend, the backend has the exact
// same function to validate file names. If these functions don't match, errors can happen.
const isSimpleValidFileName = (fileName: string) => {
    return /^[\w\-]+\.js$/.test(fileName);
};

type NewFileFieldProps = {
    newFile: boolean,
    deleteFileField: () => void
} & WithStyles<ListItemStylesTypes>;

type NewFileFieldState = {
    loggedIn: boolean,
    newFileErrorMsg: '' | 'Duplicated file name' | 'File name must match regex [\w\\\-]+\.js',
    files: state.UserFile[]
};

const NewFileField = ListItemStyles(class extends React.Component<NewFileFieldProps, NewFileFieldState> {
    listener: (event: KeyboardEvent) => void;
    constructor(props: NewFileFieldProps) {
        super(props);
        this.state = {
            newFileErrorMsg: '',
            loggedIn: false,
            files: state.files.getValue()
        };
        this.listener = (event) => {
            if (event.keyCode !== 13 || event.target === null) {
                return;
            }
            const name = (event.target as HTMLTextAreaElement).value;
            const result = this.state.files.filter((elem) => elem.name === name);
            if (result.length !== 0) {
                this.setState({ newFileErrorMsg: 'Duplicated file name' });
                return;
            }
            if (!isSimpleValidFileName(name)) {
                this.setState({ newFileErrorMsg: 'File name must match regex [\w\\-]+\.js' });
                return;
            }

            this.props.deleteFileField();
            this.setState({ newFileErrorMsg: '' });

            const oldFiles = state.files.getValue();
            state.files.next([...oldFiles, { name: name, content: '' }]);
            state.selectedFileIndex.next(oldFiles.length);
            state.loadProgram.next('');
        };
    }

    componentDidMount() {
        state.uiActive.subscribe(x => this.setState({ loggedIn: x }));
        state.files.subscribe(x => this.setState({ files: x }));
    }

    componentDidUpdate(prevProps: NewFileFieldProps) {
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
});

type Props = WithStyles<ListItemStylesTypes>;

type FileItemProps = {
    fileIndex: number,
    name: string,
    disabled: boolean
};

const FileItem = ListItemStyles(class extends React.Component<Props & FileItemProps, {selectedIndex: number, dirty: state.Dirty}> {

    private subs: Rx.Subscription[] = [];

    constructor(props: Props & FileItemProps) {
        super(props);
        this.state = {
            selectedIndex: state.selectedFileIndex.getValue(),
            dirty: state.dirty.getValue()
        };
    }

    componentDidMount() {
        this.subs.push(
            state.selectedFileIndex.subscribe(x => this.setState({ selectedIndex: x })),
            state.dirty.subscribe(x => this.setState({ dirty: x })));
    }

    componentWillUnmount() {
        for (const sub of this.subs) {
            sub.unsubscribe();
        }
    }

    onDelete() {
        const response = prompt(`Are you sure you want to permanently delete the file '${this.props.name}'? Enter YES to confirm.`);
        if (response !== "YES") {
          state.notification.next({ message: `Delete aborted: ${this.props.name}`, position: 'bottom-right' });
          return;
        }
        saveChanges({
          fileName: this.props.name,
          type: 'delete',
        }).then((response) => {
          const { fileIndex } = this.props;
          const oldFiles = state.files.getValue();
          const files = [
            ...oldFiles.slice(0, fileIndex),
            ...oldFiles.slice(fileIndex + 1)];
          const newIndex = fileIndex < files.length ? fileIndex : files.length - 1;
          state.files.next(files);
          state.selectedFileIndex.next(newIndex);
          state.loadProgram.next(files[newIndex].content);
          if (isFailureResponse(response)) {
            console.log('Oh no! File not deleted!');
            state.notification.next({ message: `Unable to delete '${this.props.name}'`, position: 'bottom-right' });
          }
          console.log('File delete!');
          state.notification.next({ message: `File deleted: ${this.props.name}`, position: 'bottom-right' });
        }).catch(error => console.log('cannot delete file', error));
    }

    render() {
        const { classes, name, disabled, fileIndex } = this.props
        const isDisabled = disabled || this.state.dirty !== 'saved';
        const isSelected = fileIndex === this.state.selectedIndex;
        return (
            <ListItem
                button
                disableGutters
                className={`${classes.nested}`}
                classes={{
                    root: `${isSelected && classes.selectedHighlight}`,
                    dense: classes.tinyPadding,
                }}
                onClick={() => {
                    state.selectedFileIndex.next(fileIndex);
                    state.loadProgram.next(state.files.getValue()[fileIndex].content);
                }}
                dense
                disabled={isDisabled}
            >
                <ListItemIcon>
                    <CodeIcon
                        className={`${classes.codeIcon} ${classes.show}`}
                    />
                </ListItemIcon>
                <CustomListItemText
                    text={name}
                    className={classes.listItemColor}
                    styleBody
                />
                < ListItemSecondaryAction className={`fadeIcon ${classes.listItemColor}`} >
                    <Tooltip
                        id="tooltip-icon"
                        title="Delete"
                        disableFocusListener
                        disableTouchListener
                        classes={{
                            tooltipPlacementBottom: classes.closerTooltip
                        }}
                    >
                        <div>  {/* surround the button with a div to suppress the warning even though it's
                                not really necessary*/}
                            <IconButton
                                aria-label="Delete"
                                color="inherit"
                                onClick={() => this.onDelete()}
                                classes={{
                                    root: classes.noButtonBackground
                                }}
                                disabled={isDisabled}
                            >
                                <DeleteIcon color="inherit" />
                            </IconButton>
                        </div>
                    </Tooltip>
                </ListItemSecondaryAction>
            </ListItem>
        );
    }
});

const UserFileItems = ListItemStyles(class extends React.Component<Props, { files: state.UserFile[], loggedIn: boolean }> {

    constructor(props: Props) {
        super(props);
        this.state = {
            loggedIn: false,
            files: state.files.getValue(),
        };
    }

    componentDidMount() {
        state.uiActive.subscribe(x => this.setState({ loggedIn: x }));
        state.files.subscribe(x => this.setState({ files: x }));
    }

    render() {
        const { files, loggedIn } = this.state;
        let disabled = !loggedIn;
        return (
            files.map((fileObj: { name: string, content: string }, index: number) => (
                <div
                    className="fileItem"
                    key={`${fileObj.name}${index + 1}`}
                >
                    <FileItem
                        fileIndex={index}
                        name={fileObj.name}
                        key={`${fileObj.name}${index + 2}`}
                        disabled={disabled}
                    />
                </div>
            ))
        );
    }
})

type State = {
    loggedIn: boolean,
    hasNewFileField: boolean,
    dirty: state.Dirty
};

class SavedIndicator extends React.Component<{}, { dirty: state.Dirty }> {

    constructor(props: {}) {
        super(props);
        this.state = {
            dirty: state.dirty.getValue()
        };
    }

    componentDidMount() {
        state.dirty.subscribe(x => this.setState({ dirty: x}));
    }

    render() {
        const text = this.state.dirty === 'saved' ? 'All Changes Saved' : 'Saving ...';
        return (
            <div style={{color: 'white', paddingLeft: '15px' }}>
                <Typography >
                    {text}
                </Typography>
            </div>
        );
    }
}

const FilesFolder = ListItemStyles(class extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            loggedIn: false,
            hasNewFileField: false,
            dirty: state.dirty.getValue()
        };
    }

    componentDidMount() {
        state.uiActive.subscribe(x => this.setState({ loggedIn: x }));
        state.dirty.subscribe(x => this.setState({ dirty: x }));
    }

    newFileField = () => { this.setState({ hasNewFileField: true }) };

    render() {
        const { classes } = this.props;

        return (
            <div>
                <div className="fileItem">
                    <ListItem
                        disabled={!this.state.loggedIn}
                        dense
                        classes={{ dense: classes.tinyPadding }}>
                    </ListItem>
                </div>
                <List component="div" disablePadding dense >
                    <SavedIndicator />
                    <div style={{color: 'white', paddingLeft: '15px' }}>
                        <Button
                                disabled={!this.state.loggedIn || this.state.dirty !== 'saved'}
                                onClick={this.newFileField}>
                            <NewIcon />
                            New
                        </Button>
                    </div>
                    <UserFileItems />
                    <NewFileField
                        newFile={this.state.hasNewFileField}
                        deleteFileField={() => { this.setState({ hasNewFileField: false }) }}
                    />
                </List>
            </div>
        );
    }
});


const sideDrawerStyles: StyleRulesCallback = theme => ({
    drawerPaper: {
        position: 'relative',
        width: '100%',
        backgroundColor: theme.palette.primary.main,
        overflow: 'hidden'
    },
    toolbar: theme.mixins.toolbar,
    noBorder: {
        borderRight: 'none'
    }
});

type SideDrawerStylesType = 'drawerPaper' | 'toolbar' | 'noBorder';

const SideDrawer: React.StatelessComponent<WithStyles<SideDrawerStylesType>> = (
    { classes }
) => (
        <Drawer
            variant="permanent"
            anchor="left"
            classes={{
                paper: classes.drawerPaper,
                paperAnchorDockedLeft: classes.noBorder
            }}
            id="sideDrawer"
        >
            <div className={classes.toolbar} style={{minHeight: '48px'}}/>
            {/* Setting toolbar is so hacky, I don't know how to override it */}
            <List dense>
                <FilesFolder />
            </List>
        </Drawer>
    );

export default withStyles(sideDrawerStyles)(SideDrawer);