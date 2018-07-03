import * as React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import CodeIcon from '@material-ui/icons/Code';
import DonutIcon from '@material-ui/icons/DonutLarge';
import CustomListItemText from 'components/CustomListItemText';
import DrawerIconButton from 'components/DrawerIconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core';

const styles: StyleRulesCallback = theme => ({
    nested: {
        paddingLeft: theme.spacing.unit * 4
    },
    listItemSelectedColor: {
        color: theme.palette.secondary.main,
        opacity: 1,
        // backgroundColor: 'rgba(0, 0, 0, 0.10)', 
        // some way to avoid (without css) making the children text have background color
    },
    listItemColor: {
        color: theme.palette.primary.contrastText,
        opacity: 0.80,
    },
    donut: {
        width: '0.6em',
        marginRight: '1em',
    },
    donutDisappear: {
        visibility: 'hidden'
    },
})

type FileItemProps = {
    isSelected?: boolean,
    onSelect: () => void,
    onDelete: () => void,
    isSaved: boolean,
    name: string
};

type Styles =
    |'nested'
    | 'listItemSelectedColor'
    | 'listItemColor'
    | 'donut'
    | 'donutDisappear';

type Props = FileItemProps & WithStyles<Styles>

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

export default withStyles(styles)(FileItem);