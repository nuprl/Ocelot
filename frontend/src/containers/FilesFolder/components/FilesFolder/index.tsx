import * as React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Collapse from '@material-ui/core/Collapse';
import CustomListItemText from 'components/CustomListItemText';
import IconButton from '@material-ui/core/IconButton';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
import 'static/styles/DrawerIconButton.css';
import UserFiles from 'components/UserFiles';
import 'static/styles/DrawerIconButton.css';
import LoadingFolderIcon from '../LoadingFolderIcon';
import ListItemStyles from 'components/ListItemStyles';
import { ListItemStylesTypes } from 'components/ListItemStyles';
import { WithStyles } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

type FilesFolderProps = {
    open: boolean,
    disabled: boolean,
    toggleFolder: () => void,
    onCreateFile: () => void,
};

type Props = FilesFolderProps & WithStyles<ListItemStylesTypes>;

const FilesFolder: React.StatelessComponent<Props>
    = ({ open, disabled, toggleFolder, onCreateFile, classes }) => (
        <div>
            <ListItem
                button
                onClick={toggleFolder}
                disabled={disabled}
                className="fileItem"
            >
                <LoadingFolderIcon loading={disabled} className={classes.listItemColor} />
                <CustomListItemText text="Files" className={classes.listItemColor} />
                {/* -- Delete Button -- */}
                < ListItemSecondaryAction className={`fadeIcon ${classes.listItemColor}`} >
                    <Tooltip id="tooltip-icon" title="New File" disableHoverListener={disabled}>
                        <div>  {/* surround the button with a div to suppress the warning even though it's
                            not really necessary*/}
                            <IconButton
                                aria-label="New File"
                                color="inherit"
                                disabled={disabled}
                                onClick={onCreateFile}
                            >
                                <AddIcon color="inherit" />
                            </IconButton>
                        </div>
                    </Tooltip>
                </ListItemSecondaryAction>
                {/* ---- */}
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding dense>
                    <UserFiles />
                </List>
            </Collapse>
        </div>
    );

export default ListItemStyles(FilesFolder);