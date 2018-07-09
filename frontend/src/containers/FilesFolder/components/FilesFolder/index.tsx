import * as React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Collapse from '@material-ui/core/Collapse';
import ItemTypography from 'components/ItemTypography';
import IconButton from '@material-ui/core/IconButton';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
import 'static/styles/DrawerIconButton.css';
import UserFiles from '../UserFiles';
import 'static/styles/DrawerIconButton.css';
import LoadingFolderIcon from '../LoadingFolderIcon';
import ListItemStyles from 'components/ListItemStyles';
import { ListItemStylesTypes } from 'components/ListItemStyles';
import { WithStyles } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

type FilesFolderProps = {
    disabled: boolean,
    onCreateFile: () => void,
};

type Props = FilesFolderProps & WithStyles<ListItemStylesTypes>;

type State = {
    open: boolean,
};

class FilesFolder extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            open: false,
        };
    }

    toggleFolder = () => {
        this.setState((prevState) => ({open: !prevState.open}));
    };

    render() {
        const { disabled, onCreateFile, classes } = this.props;
        const { open } = this.state;
        
        return (
            <div>
                <div className="fileItem">
                    <ListItem
                        button
                        onClick={this.toggleFolder}
                        disabled={disabled}
                    >
                        <LoadingFolderIcon loading={disabled} className={classes.listItemColor} />
                        <ItemTypography text="Files" className={classes.listItemColor} />
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
                </div>
                <Collapse in={open} timeout="auto">
                    <List component="div" disablePadding dense>
                        <UserFiles />
                    </List>
                </Collapse>
            </div>
        );
    }
}
export default ListItemStyles(FilesFolder);