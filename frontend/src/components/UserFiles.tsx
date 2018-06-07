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
    selectedFileIndex: number,
    makeHandleClickFile: (index: number) => () => void,
 };

function UserFiles(props: WithStyles<string> & Props) {
    const { files, classes, selectedFileIndex } = props;
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
                    onClick={props.makeHandleClickFile(index)}
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
        </div>
    );
}

export default withStyles(styles)(UserFiles);