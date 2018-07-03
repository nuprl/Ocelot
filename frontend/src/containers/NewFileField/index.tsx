import * as React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import CodeIcon from '@material-ui/icons/Code';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
import Input from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';
// TODO: create a separate module with withStyles(styles) higher order component exported
// in static folder and have it used in places where it needs it.
const NewFileField: React.StatelessComponent<Props> = ({ wantNewFile }) => {
    return (
        <ListItem className={`${classes.nested} ${classes.listItemColor}`}>
            <ListItemIcon>
                <CodeIcon className={classes.listItemColor} />
            </ListItemIcon>
            <ListItemText
                disableTypography
                primary={
                    <FormControl
                        className={classes.formControl}
                        aria-describedby="name-helper-text"
                        margin="none"
                    >
                        <Input
                            id="filename-input"
                            classes={{
                                root: classes.textField
                            }}
                        />
                    </FormControl>}
                classes={{ root: classes.listItemColor }}
            />
            <ListItemSecondaryAction
                className={`${classes.listItemColor}`}
            >
                <Tooltip id="tooltip-icon" title="Delete">
                    <IconButton
                        aria-label="delete"
                        color="inherit"
                        className={`${classes.listItemColor}`}
                        onClick={this.props.onNoNewFile}
                    >
                        <DeleteIcon color="inherit" />
                    </IconButton>
                </Tooltip>
            </ListItemSecondaryAction>
        </ListItem>

    );
}