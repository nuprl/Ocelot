import * as React from 'react';
import List from '@material-ui/core/List';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import FolderIcon from '@material-ui/icons/Folder';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
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
    files?: { name: string, content: string }[],
    createSnackbarError: (message: string) => void,
    onUpdateFiles: (file: { name: string, content: string }[]) => void,
    onSelectFile: (fileIndex: number) => void,
};

type State = {
    open: boolean,
    filesLoading: boolean,
    files: { name: string, content: string }[],
    selectedFileIndex: number,
};

class FilesFolderList extends React.Component<WithStyles<string> & Props, State> {
    constructor(props: WithStyles<string> & Props) {
        super(props);
        this.state = {
            open: false,
            filesLoading: true,
            files: [],
            selectedFileIndex: -1,
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

            this.setState({ files: jsonResponse.data.userFiles });
            this.props.onUpdateFiles(jsonResponse.data.userFiles);

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
            this.setState({ selectedFileIndex: index });
            this.props.onSelectFile(index);
        });
    }

    render() {
        const { classes } = this.props;
        const { open, files, selectedFileIndex } = this.state;

        return (
            <div>
                <div className="fileItem">
                    <ListItem
                        button
                        onClick={this.handleClick}
                    >
                        <ListItemIcon>
                            <FolderIcon className={classes.listItemColor} />
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
                            <Tooltip id="tooltip-icon" title="New File">
                                <IconButton
                                    aria-label="create"
                                    color="inherit"
                                    className={classes.listItemColor}
                                >
                                    <AddIcon color="inherit" />
                                </IconButton>
                            </Tooltip>
                        </ListItemSecondaryAction>
                    </ListItem>
                </div>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding dense>

                        {
                            files.map((fileObj: { name: string, content: string }, index: number) => (
                                <div
                                    className="fileItem"
                                    key={`${name}${index + 1}`}
                                >
                                    <ListItem
                                        button
                                        className={`${classes.nested} ${selectedFileIndex === index
                                            ? classes.listItemSelectedColor
                                            : classes.listItemColor}`}
                                        onClick={this.makeHandleClickFile(index)}
                                        key={`${name}${index + 2}`}
                                    >
                                        <ListItemIcon key={`${name}${index + 3}`}>
                                            <InsertDriveFileIcon
                                                className={selectedFileIndex === index
                                                    ? classes.listItemSelectedColor
                                                    : classes.listItemColor}
                                                key={`${name}${index + 4}`}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            inset
                                            disableTypography
                                            primary={
                                                <Typography
                                                    variant="body1"
                                                    className={selectedFileIndex === index
                                                        ? classes.listItemSelectedColor
                                                        : classes.listItemColor}
                                                >
                                                    {fileObj.name}
                                                </Typography>}
                                            classes={{ root: classes.listItemColor }}
                                            key={`${name}${index + 5}`}
                                        />
                                        <ListItemSecondaryAction
                                            key={`${name}${index + 6}`}
                                            className={`${classes.listItemColor} fadeIcon`}
                                        >
                                            <Tooltip id="tooltip-icon" title="Delete" key={`${name}${index + 7}`}>
                                                <IconButton
                                                    aria-label="delete"
                                                    color="inherit"
                                                    className={``}
                                                    key={`${name}${index + 8}`}
                                                >
                                                    <DeleteIcon color="inherit" key={`${name}${index + 9}`} />
                                                </IconButton>
                                            </Tooltip>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                </div>
                            ))}

                    </List>
                </Collapse>
            </div>
        );
    }
}

export default withStyles(styles)(FilesFolderList);