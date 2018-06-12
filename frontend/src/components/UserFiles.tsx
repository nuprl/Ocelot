import * as React from 'react';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
import '../styles/FilesFolderList.css';
import Input from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';

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
        // backgroundColor: 'rgba(0, 0, 0, 0.10)', 
        // some way to avoid (without css) making the children text have background color
    },
    textField: {
        color: theme.palette.primary.contrastText,
        width: '80%',
    }
});

type Props = {
    files: { name: string, content: string }[],
    selectedFileIndex: number,
    makeHandleClickFile: (index: number) => () => void,
    makeHandleDeleteFile: (index: number) => () => void,
    onCreatedFile: (fileName: string) => void,
    newFile: boolean,
    onNoNewFile: () => void,
};

class UserFiles extends React.Component<WithStyles<string> & Props> {

    componentDidUpdate() {
        var filenameInput = document.getElementById('filename-input');
        if (filenameInput === null) {
            return;
        }
        filenameInput.addEventListener('keyup', (event) => {
            if (event.keyCode !== 13 || event.target === null) {
                return;
            }
            const name = (event.target as HTMLTextAreaElement).value;
            const result = this.props.files.filter((elem) => elem.name === name);
            if (result.length !== 0) {
                return;
            }
            this.props.onCreatedFile(name);
        });

    }

    render() {
        const { files, classes, selectedFileIndex, newFile } = this.props;
        return (
            <div>
                {files.map((fileObj: { name: string, content: string }, index: number) => (
                    <div
                        className="fileItem"
                        key={`${name}${index + 1}`}
                    >
                        <ListItem
                            button
                            className={`${classes.nested} ${selectedFileIndex === index
                                ? classes.listItemSelectedColor
                                : classes.listItemColor}`}
                            onClick={this.props.makeHandleClickFile(index)}
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
                                        onClick={this.props.makeHandleDeleteFile(index)}
                                    >
                                        <DeleteIcon color="inherit" key={`${name}${index + 9}`} />
                                    </IconButton>
                                </Tooltip>
                            </ListItemSecondaryAction>
                        </ListItem>
                    </div>
                ))}
                {newFile &&
                    <ListItem className={`${classes.nested} ${classes.listItemColor}`}>
                        <ListItemIcon>
                            <InsertDriveFileIcon className={classes.listItemColor} />
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
                                    onClick={this.props.onNoNewFile}
                                >
                                    <DeleteIcon color="inherit" />
                                </IconButton>
                            </Tooltip>
                        </ListItemSecondaryAction>
                    </ListItem>
                }
            </div>
        );
    }
}
export default withStyles(styles)(UserFiles);