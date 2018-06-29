import * as React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import {SvgIconProps} from '@material-ui/core/SvgIcon';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';

const styles: StyleRulesCallback = theme => ({
    listItemColor: {
        color: theme.palette.primary.contrastText,
        opacity: 0.85,
    }
});


type ListItemButtonProps = {
    icon: React.ReactElement<SvgIconProps>,
    text: string,
};

const ListItemButton: React.StatelessComponent<WithStyles<'listItemColor'> & ListItemButtonProps>
    = ({ icon, text, classes }) => (
        <ListItem button>
            <ListItemIcon className={classes.listItemColor}>
                {icon}
            </ListItemIcon>
            <ListItemText
                disableTypography
                primary={
                    <Typography variant="subheading" className={classes.listItemColor}>
                        {text}
                    </Typography>}
                classes={{ root: classes.listItemColor }}
            />
        </ListItem>
    )

export default withStyles(styles)(ListItemButton);