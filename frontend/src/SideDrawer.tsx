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
import * as utils from './utils';
import { connect } from './reactrx';
import { console } from './errors';
import './static/styles/unresizableToolbar.css';

// NOTE (Sam): If you make any changes for isSimpleValidFileName
// You have to do the same for the backend, the backend has the exact
// same function to validate file names. If these functions don't match, errors can happen.
const isSimpleValidFileName = (fileName: string) => {
    return /^[\w\-]+\.js$/.test(fileName);
};

type NewFileFieldProps = {
    newFile: boolean,
    deleteFileField: () => void,
    selectedFilename: Rx.BehaviorSubject<string | false>
} & WithStyles<ListItemStylesTypes>;

type NewFileFieldState = {
    loggedIn: boolean,
    newFileErrorMsg: '' | 'Duplicated file name' | 'File name must match regex [\w\\\-]+\.js',
    files: string[]
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
        connect(this, 'loggedIn', state.uiActive);
        connect(this, 'files', state.files);

        this.listener = (event) => {
            if (event.keyCode !== 13 || event.target === null) {
                return;
            }
            const name = (event.target as HTMLTextAreaElement).value;
            if (this.state.files.indexOf(name) !== -1) {
                this.setState({ newFileErrorMsg: 'Duplicated file name' });
                return;
            }
            if (!isSimpleValidFileName(name)) {
                this.setState({ newFileErrorMsg: 'File name must match regex [\w\\-]+\.js' });
                return;
            }

            this.props.deleteFileField();
            this.setState({ newFileErrorMsg: '' });
            state.notify('Creating new file ...');
            saveChanges({ fileName: name, type: 'create', changes: '' })
                .then(result => {
                    if (result.status !== 'SUCCESS') {
                        throw 'failure response from server';
                    }
                    state.files.next([name, ...state.files.getValue()]);
                    this.props.selectedFilename.next(name);
                    state.loadProgram.next({kind: 'program', name: name, content: '' });
                    state.notify('File created.');
                })
                .catch(reason => {
                    state.notify('Could not create file');
                    console.error(`failed to create file (reason: ${reason}`);
                });
        };
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
    selectedFilename: Rx.BehaviorSubject<string | false>,
    name: string,
    disabled: boolean
};

const FileItem = ListItemStyles(class extends React.Component<Props & FileItemProps, {selectedFilename: string | false, dirty: state.Dirty}> {

    constructor(props: Props & FileItemProps) {
        super(props);
        this.state = {
            selectedFilename: props.selectedFilename.getValue(),
            dirty: state.dirty.getValue()
        };
        connect(this, 'selectedFilename', props.selectedFilename);
        connect(this, 'dirty', state.dirty);
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
            if (this.state.selectedFilename === this.props.name) {
                this.props.selectedFilename.next(false);
            }
            state.files.next(state.files.getValue()
                    .filter(x => x !== this.props.name));
          if (isFailureResponse(response)) {
            state.notification.next({ message: `Unable to delete '${this.props.name}'`, position: 'bottom-right' });
          }
          state.notify(`Deleted ${this.props.name}`);
        }).catch(reason => console.log(`Delete failed: ${reason}`));
    }

    render() {
        const { classes, name, disabled } = this.props
        const isDisabled = disabled || this.state.dirty !== 'saved';
        const isSelected = name === this.state.selectedFilename;
        return (
            <ListItem
                button
                disableGutters
                className={`${classes.nested}`}
                classes={{
                    root: `${isSelected && classes.selectedHighlight}`,
                    dense: classes.tinyPadding,
                }}
                onClick={() =>this.props.selectedFilename.next(name)}
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

const UserFileItems = ListItemStyles(class extends React.Component<Props & { selectedFilename: Rx.BehaviorSubject<string | false> }, { files: string[], loggedIn: boolean }> {

    constructor(props: Props & { selectedFilename: Rx.BehaviorSubject<string | false> }) {
        super(props);
        this.state = {
            loggedIn: false,
            files: state.files.getValue(),
        };
        connect(this, 'loggedIn', state.uiActive);
        connect(this, 'files', state.files);
    }

    render() {
        const { files, loggedIn } = this.state;
        let disabled = !loggedIn;
        return (
          <div className="fileList scrollbars" style={{height:'100%', overflowY:'scroll'}}>
           {files.map(name =>
            <div className="fileItem" key={name}>
                <FileItem name={name} disabled={disabled}
                    selectedFilename={this.props.selectedFilename} />
            </div>)}
          </div>
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
        connect(this, 'dirty', state.dirty);
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

    private selectedFilename: Rx.BehaviorSubject<string | false>;

    constructor(props: Props) {
        super(props);
        this.state = {
            loggedIn: false,
            hasNewFileField: false,
            dirty: state.dirty.getValue()
        };
        connect(this, 'loggedIn', state.uiActive);
        connect(this, 'dirty', state.dirty);
        this.selectedFilename = new Rx.BehaviorSubject<string | false>(false);
        this.selectedFilename.subscribe(name => {
            const email = state.email();
            if (name === false || email === false) {
                state.loadProgram.next({ kind: 'nothing' });
                return;
            }
            utils.postJson('read', { filename: name })
                .then(content => {
                    // NOTE(arjun): assumes that content is a string
                    state.loadProgram.next({ kind: 'program', name, content });
                })
                .catch(reason => {
                    state.notify(`Failed to load ${name}. Please try again`);
                    this.selectedFilename.next(false);
                })
        });

    }

    newFileField = () => { this.setState({ hasNewFileField: true }) };

    render() {
        return (
            <div style={{height:'100%'}}>
                <List style={{height:'100%'}} component="div" disablePadding dense >
                    <SavedIndicator />
                    <div style={{color: 'white', paddingLeft: '15px' }}>
                        <Button
                                disabled={!(this.state.loggedIn && this.state.dirty === 'saved')}
                                onClick={this.newFileField}>
                            <NewIcon />
                            New
                        </Button>
                    </div>
                    <NewFileField
                        selectedFilename={this.selectedFilename}
                        newFile={this.state.hasNewFileField}
                        deleteFileField={() => { this.setState({ hasNewFileField: false }) }}
                    />
                    <div style={{height:'calc(100% - 108px'}}>
                      <UserFileItems selectedFilename={this.selectedFilename} />
                    </ div>
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
            style={{height:'100%'}}
            id="sideDrawer"
        >
            <div className={classes.toolbar} id="sideDrawerToolbar"/>
            {/* Setting toolbar is so hacky, I don't know how to override it */}
            <List style={{height:'100%'}} dense>
                <FilesFolder />
            </List>
        </Drawer>
    );

export default withStyles(sideDrawerStyles)(SideDrawer);