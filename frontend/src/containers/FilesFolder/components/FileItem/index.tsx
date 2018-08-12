import * as React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import CodeIcon from '@material-ui/icons/Code';
import CustomListItemText from '../../../../components/ItemTypography';
import DeleteIcon from '@material-ui/icons/Delete';
import ListItemStyles from '../../../../components/ListItemStyles';
import { ListItemStylesTypes } from '../../../../components/ListItemStyles';
import { WithStyles } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
import 'static/styles/DrawerIconButton.css';
import { connect } from 'react-redux';
import { RootState } from '../../../../store';

type FileItemProps = {
    isSelected?: boolean,
    onSelect: () => void,
    onDelete: () => void,
    name: string,
    loggedIn: boolean,
};

type Props = FileItemProps & WithStyles<ListItemStylesTypes>;

const FileItem: React.StatelessComponent<Props> = ({
    isSelected = false,
    onSelect,
    onDelete,
    classes,
    name,
    loggedIn,
}) => {
    let disabled = false;
    if (!loggedIn) {
        const mustLogin = window.location.search !== '?anonymous';
        disabled = mustLogin && !loggedIn;
    }
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
            disabled={disabled}
        >
            <ListItemIcon>
                <CodeIcon
                    className={`${classes.codeIcon} ${classes.show}`}
                />
            </ListItemIcon>
            <CustomListItemText
                text={name}
                className={classes.listItemColor}
                styleBody
            />
            < ListItemSecondaryAction className={`fadeIcon ${classes.listItemColor}`} >
                <Tooltip
                    id="tooltip-icon"
                    title="Delete"
                    disableFocusListener
                    disableTouchListener
                    classes={{
                        tooltipPlacementBottom: classes.closerTooltip
                    }}
                >
                    <div>  {/* surround the button with a div to suppress the warning even though it's
                            not really necessary*/}
                        <IconButton
                            aria-label="Delete"
                            color="inherit"
                            onClick={onDelete}
                            classes={{
                                root: classes.noButtonBackground
                            }}
                            disabled={disabled}
                        >
                            <DeleteIcon color="inherit" />
                        </IconButton>
                    </div>
                </Tooltip>
            </ListItemSecondaryAction>
        </ListItem>
    );
};

const mapStateToProps = (state: RootState) => ({
    loggedIn: state.userLogin.loggedIn
});

export default connect(mapStateToProps)(ListItemStyles(FileItem));