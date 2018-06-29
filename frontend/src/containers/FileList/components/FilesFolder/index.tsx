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
import '../static/FilesFolderList.css';

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

type State = {
    open: boolean,
    filesLoading: boolean
};

class FilesFolderList extends React.Component<WithStyles<string>, State> {
    constructor(props: WithStyles<string>) {
        super(props);
        this.state = {
            open: false,
            filesLoading: true,
        };
    }

    handleClick = () => {
        this.setState(prevState => ({ open: !prevState.open })); // setState is asynchronous, so doing 
        // setState({open: !this.state.open}) may not yield the correct result.
    };

    render() {
        const { classes, files, selectedFileIndex, fileSaved } = this.props;
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
                        {/* Create button */}
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
                            fileSaved={fileSaved}
                        />
                    </List>
                </Collapse>
            </div>
        );
    }
}

export default withStyles(styles)(FilesFolderList);