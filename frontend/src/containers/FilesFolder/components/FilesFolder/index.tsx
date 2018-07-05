import * as React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Collapse from '@material-ui/core/Collapse';
import CustomListItemText from 'components/CustomListItemText';
import CreateFileButton from 'containers/CreateFileButton';
import UserFiles from 'components/UserFiles';
import 'static/styles/DrawerIconButton.css';
import LoadingFolderIcon from '../LoadingFolderIcon';
import ListItemStyles from 'components/ListItemStyles';
import { ListItemStylesTypes } from 'components/ListItemStyles';
import { WithStyles } from '@material-ui/core';

type FilesFolderProps = {
    open: boolean,
    disabled: boolean,
    toggleFolder: () => void,
};

type Props = FilesFolderProps & WithStyles<ListItemStylesTypes>;

const FilesFolder: React.StatelessComponent<Props>
    = ({ open, disabled, toggleFolder, classes }) => (
        <div className="fileItem">
            <ListItem
                button
                onClick={toggleFolder}
                disabled={disabled}
            >
                <LoadingFolderIcon loading={disabled} className={classes.listItemColor}/>
                <CustomListItemText text="Files" className={classes.listItemColor}/>
                <CreateFileButton />
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding dense>
                    <UserFiles />
                </List>
            </Collapse>
        </div>
    );

export default ListItemStyles(FilesFolder);