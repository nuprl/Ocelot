import * as React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import CodeIcon from '@material-ui/icons/Code';
import DonutIcon from '@material-ui/icons/DonutLarge';
import CustomListItemText from 'components/CustomListItemText';
import DrawerIconButton from 'components/DrawerIconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import ListItemStyles from 'components/ListItemStyles';
import { ListItemStylesTypes } from 'components/ListItemStyles';
import { WithStyles } from '@material-ui/core';

type FileItemProps = {
    isSelected?: boolean,
    onSelect: () => void,
    onDelete: () => void,
    isSaved: boolean,
    name: string
};

type Props = FileItemProps & WithStyles<ListItemStylesTypes>

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
                className={classes.listItemColor}
            />
            <DonutIcon
                className={`${classes.listItemColor}
                ${classes.donut}
                ${isSaved && classes.donutDisappear}`}

            />
            <DrawerIconButton
                onClick={onDelete}
                icon={<DeleteIcon color="inherit" />}
                title="Delete"
                className={classes.listItemColor}
            />
        </ListItem>
    )
}

export default ListItemStyles(FileItem);