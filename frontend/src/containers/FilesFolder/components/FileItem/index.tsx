import * as React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import CodeIcon from '@material-ui/icons/Code';
import CustomListItemText from 'components/ItemTypography';
import DeleteIcon from '@material-ui/icons/Delete';
import ListItemStyles from 'components/ListItemStyles';
import { ListItemStylesTypes } from 'components/ListItemStyles';
import { WithStyles } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';
import 'static/styles/DrawerIconButton.css';

type FileItemProps = {
    isSelected?: boolean,
    onSelect: () => void,
    onDelete: () => void,
    isSaved: boolean,
    name: string
};

type Props = FileItemProps & WithStyles<ListItemStylesTypes>;

const FileItem: React.StatelessComponent<Props> = ({
    isSelected = false,
    onSelect,
    onDelete,
    classes,
    isSaved,
    name,
}) => {
    return (
        <ListItem
            button
            disableGutters
            className={`${classes.nested}`}
            classes={{
                root: `${isSelected && classes.selectedHighlight}`,
                dense: classes.tinyPadding,
            }}
            onClick={onSelect}
            dense
        >
            <ListItemIcon>
                <CodeIcon
                    className={`${classes.codeIcon} ${isSaved && classes.show}`}
                />
            </ListItemIcon>
            {
                !isSaved &&
                <ListItemIcon>
                    <CircularProgress
                        size={24}
                        color="inherit"
                        thickness={4}
                        style={{ position: 'absolute' }}
                        classes={{ svg: `${classes.loadingIcon} ${classes.show}` }}
                    />
                </ListItemIcon>
            }

            <CustomListItemText
                text={name}
                className={classes.listItemColor}
                styleBody
            />
            < ListItemSecondaryAction className={`fadeIcon ${classes.listItemColor}`} >
                <Tooltip id="tooltip-icon" title="Delete">
                    <div>  {/* surround the button with a div to suppress the warning even though it's
                            not really necessary*/}
                        <IconButton
                            aria-label="Delete"
                            color="inherit"
                            onClick={onDelete}
                        >
                            <DeleteIcon color="inherit" />
                        </IconButton>
                    </div>
                </Tooltip>
            </ListItemSecondaryAction>
        </ListItem>
    );
};

export default ListItemStyles(FileItem);