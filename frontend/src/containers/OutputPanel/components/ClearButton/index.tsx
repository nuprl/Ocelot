import * as React from 'react';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/ClearAll';
import Tooltip from '@material-ui/core/Tooltip';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core';

const styles: StyleRulesCallback = theme => ({
    button: {
        marginRight: theme.spacing.unit,
    }
});

type Props = {
    onClick: () => void,
} & WithStyles<'button'>;

const ClearButton: React.StatelessComponent<Props>
    = ({ onClick, classes }) => (
        <Tooltip id="tooltip-icon" title="Clear" placement="top">
            <IconButton
                aria-label="Clear"
                color="inherit"
                onClick={onClick}
                className={classes.button}
            >
                <ClearIcon color="inherit" />
            </IconButton>
        </Tooltip>
    );

export default withStyles(styles)(ClearButton);