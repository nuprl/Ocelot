import * as React from 'react';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core';

const styles: StyleRulesCallback = theme => ({
    listItemColor: {
        color: theme.palette.primary.contrastText,
        opacity: 0.85,
    }
});

type Props = { text: string } & WithStyles<'listItemColor'>;

const CustomListItemText: React.StatelessComponent<Props> = ({ text, classes }) => (
    <ListItemText
        disableTypography
        primary={
            <Typography variant="subheading" className={classes.listItemColor}>
                {text}
            </Typography>}
        classes={{ root: classes.listItemColor }}
    />
)

export default withStyles(styles)(CustomListItemText);