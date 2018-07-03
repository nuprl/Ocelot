import * as React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Collapse from '@material-ui/core/Collapse';
import CustomListItemText from 'components/CustomListItemText'
import CreateFileButton from 'containers/CreateFileButton';
import UserFiles from './UserFiles';
import 'static/styles/DrawerIconButton.css';
import LoadingFolderIcon from '../LoadingFolderIcon';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core';

const styles: StyleRulesCallback = theme => ({
    listItemColor: {
        color: theme.palette.primary.contrastText,
        opacity: 0.85,
    }
})

type FilesFolderProps = {
    open: boolean,
    disabled: boolean,
    toggleFolder: () => void,
}

type Props = FilesFolderProps & WithStyles<'listItemColor'>;

const FilesFolder: React.StatelessComponent<Props>
    = ({ open, disabled, toggleFolder, classes }) => (
        <div>
            {/* Maybe need a div with fileItem className */}
            <ListItem
                button
                onClick={toggleFolder}
                disabled={disabled}
                className="fileItem"
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
    )

export default withStyles(styles)(FilesFolder);