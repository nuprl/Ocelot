import * as React from 'react';
import List from '@material-ui/core/List';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import FolderIcon from '@material-ui/icons/Folder';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';
import UserFiles from './UserFiles';
import '../styles/FilesFolderList.css';

const styles: StyleRulesCallback = theme => ({
    nested: {
        paddingLeft: theme.spacing.unit * 4
    },
    listItemColor: {
        color: theme.palette.primary.contrastText,
        opacity: 0.80,
    },
    listItemSelectedColor: {
        color: theme.palette.secondary.main,
        opacity: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.10)',
    }
});

type Props = {
    files: { name: string, content: string }[],
    selectedFileIndex: number
    createSnackbarError: (message: string) => void,
    onUpdateFiles: (file: { name: string, content: string }[]) => void,
    onSelectFile: (fileIndex: number) => void,
    onDeleteFile: (index: number) => void,
    onCreatedFile: (fileName: string) => void,
};

type State = {
    open: boolean,
    filesLoading: boolean,
    newFile: boolean,
};

class FilesFolderList extends React.Component<WithStyles<string> & Props, State> {
    constructor(props: WithStyles<string> & Props) {
        super(props);
        this.state = {
            open: false,
            filesLoading: true,
            newFile: false,
        };
    }

    componentWillMount() {
        const userEmail = localStorage.getItem('userEmail');
        const sessionId = localStorage.getItem('sessionId');

        if (userEmail !== null && sessionId !== null) {
            this.getUserFiles(userEmail, sessionId);
            return;
        }

        this.props.createSnackbarError('Seems like your session expired, try logging in again');
    }

    getUserFiles = async (userEmail: string, sessionId: string) => {
        this.setState({ filesLoading: true });
        let url = 'https://us-central1-umass-compsci220.cloudfunctions.net/paws/getfile';
        // domain to send post requests to

        if (window.location.host.substring(0, 9) === 'localhost') { // if hosted on localhost
            url = 'http://localhost:8000/getfile';
        }

        const data = { userEmail: userEmail, sessionId: sessionId };

        try {
            const response = await fetch(url, { // send json data to specified URL
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const jsonResponse = await response.json(); // get json response
            this.setState({ filesLoading: false });

            if (jsonResponse.status === 'error') {
                // create snackbar
                return;
            }

            if (jsonResponse.status === 'failure') {
                // create snackbar
                return;
            }

            this.props.onUpdateFiles(jsonResponse.data.userFiles);
            this.setState({ open: true });

        } catch (error) {
            // create snackbar
            this.setState({
                filesLoading: false
            });
            this.props.createSnackbarError(`Couldn't connect to the server at the moment, try again later`);
        }

    };

    handleClick = () => {
        this.setState(prevState => ({ open: !prevState.open })); // setState is asynchronous, so doing 
        // setState({open: !this.state.open}) may not yield the correct result.
    };

    makeHandleClickFile = (index: number) => {
        return (() => {
            this.props.onSelectFile(index);
        });
    }

    makeHandleDeleteFile = (index: number) => {
        return (() => {
            this.props.onDeleteFile(index);
        });
    }

    onCreateFile = () => {
        this.setState({
            newFile: true,
            open: true,
        });
    }

    onCreatedFile = (fileName: string) => {
        this.setState({ newFile: false });
        this.props.onCreatedFile(fileName);
    };

    onNoNewFile = () => {
        this.setState({
            newFile: false,
        });
    };

    render() {
        const { classes, files, selectedFileIndex } = this.props;
        const { open, filesLoading, newFile } = this.state;

        return (
            <div>
                <div className="fileItem">
                    <ListItem
                        button
                        onClick={this.handleClick}
                        disabled={filesLoading}
                    >
                        <ListItemIcon>
                            {filesLoading
                                ? <CircularProgress
                                    className={`${classes.progress} ${classes.listItemColor}`}
                                    size={24}
                                    thickness={5}
                                />
                                : <FolderIcon className={classes.listItemColor} />}
                        </ListItemIcon>
                        <ListItemText
                            disableTypography
                            primary={
                                <Typography variant="subheading" className={classes.listItemColor}>
                                    Files
                                </Typography>}
                            classes={{ root: classes.listItemColor }}
                        />
                        <ListItemSecondaryAction className="fadeIcon">
                            <Tooltip id="tooltip-icon" title="New File" disableHoverListener={filesLoading}>
                                <div>  {/* surround the button with a div to suppress the warning even though it's
                            not really necessary*/}
                                    <IconButton
                                        aria-label="create"
                                        color="inherit"
                                        className={classes.listItemColor}
                                        disabled={filesLoading}
                                        onClick={this.onCreateFile}
                                    >
                                        <AddIcon color="inherit" />
                                    </IconButton>
                                </div>
                            </Tooltip>
                        </ListItemSecondaryAction>
                    </ListItem>
                </div>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding dense>
                        <UserFiles
                            files={files}
                            selectedFileIndex={selectedFileIndex}
                            makeHandleClickFile={this.makeHandleClickFile}
                            makeHandleDeleteFile={this.makeHandleDeleteFile}
                            onCreatedFile={this.onCreatedFile}
                            newFile={newFile}
                            onNoNewFile={this.onNoNewFile}
                        />
                    </List>
                </Collapse>
            </div>
        );
    }
}

export default withStyles(styles)(FilesFolderList);