import * as React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Collapse from '@material-ui/core/Collapse';
import ItemTypography from '../../../../components/ItemTypography';
import IconButton from '@material-ui/core/IconButton';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
import 'static/styles/DrawerIconButton.css';
import UserFileItems from '../../containers/UserFileItems';
import NewFileField from '../../containers/NewFileField';
import 'static/styles/DrawerIconButton.css';
import LoadingFolderIcon from '../LoadingFolderIcon';
import ListItemStyles from '../../../../components/ListItemStyles';
import { ListItemStylesTypes } from '../../../../components/ListItemStyles';
import { WithStyles } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

type FilesFolderProps = {
    open: boolean,
    disabled: boolean,
    toggleFolder: () => void,
};

type Props = FilesFolderProps & WithStyles<ListItemStylesTypes>;

type State = {
    hasNewFileField: boolean,
};

class FilesFolder extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            hasNewFileField: false,
        }
    }

    newFileField = () => { this.setState({ hasNewFileField: true }) };

    render() {
        const { open, disabled, toggleFolder, classes } = this.props;

        return (
            <div>
                <div className="fileItem">
                    <ListItem
                        button
                        onClick={toggleFolder}
                        disabled={disabled}
                        dense
                        classes={{ dense: classes.tinyPadding }}
                    >
                        <LoadingFolderIcon loading={disabled} className={classes.listItemColor} />
                        <ItemTypography text="Files" className={classes.listItemColor} />
                        {/* -- Delete Button -- */}
                        < ListItemSecondaryAction className={`fadeIcon ${classes.listItemColor}`} >
                            <Tooltip
                                id="tooltip-icon"
                                title="New File"
                                disableHoverListener={disabled}
                                disableFocusListener
                                disableTouchListener
                                classes={{
                                    tooltipPlacementBottom: classes.closerTooltip
                                }}
                            >
                                <div>  {/* surround the button with a div to suppress the warning even though it's
                            not really necessary*/}
                                    <IconButton
                                        aria-label="New File"
                                        color="inherit"
                                        disabled={disabled}
                                        onClick={this.newFileField}
                                        classes={{ root: classes.noButtonBackground }}
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
                    <List
                        component="div"
                        disablePadding
                        dense
                    >
                        <UserFileItems />
                        <NewFileField
                            newFile={this.state.hasNewFileField}
                            deleteFileField={() => { this.setState({ hasNewFileField: false }) }}
                        />
                    </List>
                </Collapse>
            </div>
        );
    }
}
export default ListItemStyles(FilesFolder);