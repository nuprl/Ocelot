import * as React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Collapse from '@material-ui/core/Collapse';
import CustomListItemText from 'components/CustomListItemText'
import CreateFileButton from 'containers/CreateFileButton';
import UserFiles from './UserFiles';
import 'static/styles/DrawerIconButton.css';
import LoadingFolderIcon from '../LoadingFolderIcon';

type FilesFolderProps = {
    open: boolean,
    disabled: boolean,
    toggleFolder: () => void,
}

type Props = FilesFolderProps;

const FilesFolder: React.StatelessComponent<Props>
    = ({ open, disabled, toggleFolder }) => (
        <div>
            {/* Maybe need a div with fileItem className */}
            <ListItem
                button
                onClick={toggleFolder}
                disabled={disabled}
                className="fileItem"
            >
                <LoadingFolderIcon loading={disabled} />
                <CustomListItemText text="Files" />
                <CreateFileButton />
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding dense>
                    <UserFiles />
                </List>
            </Collapse>
        </div>
    )

export default FilesFolder;