import * as React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import CodeIcon from '@material-ui/icons/Code';
import DonutIcon from '@material-ui/icons/DonutLarge';
import CustomListItemText from 'components/CustomListItemText';
import DeleteIcon from '@material-ui/icons/Delete';
import ListItemStyles from 'components/ListItemStyles';
import { ListItemStylesTypes } from 'components/ListItemStyles';
import { WithStyles } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
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

    let currentStyleClass = classes.listItemColor;
    if (isSelected) {
        currentStyleClass = classes.listItemSelectedColor;
    }

    return (
        <ListItem
            button
            className={`${classes.nested} ${currentStyleClass}`}
            onClick={onSelect}
        >
            <ListItemIcon>
                <CodeIcon
                    className={currentStyleClass}
                />
            </ListItemIcon>
            <CustomListItemText
                text={name}
                className={currentStyleClass}
                styleBody
            />
            <DonutIcon
                className={`${classes.listItemColor}
                ${classes.donut}
                ${isSaved && classes.donutDisappear}`}

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