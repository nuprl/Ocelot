import * as React from 'react';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import { mailFolderListItems, otherMailFolderListItems } from './tileData';

const drawerWidth = 240;

let colors: any = {};

const styles: StyleRulesCallback = theme => {
    colors = {
        primary: theme.palette.primary.main,
        text: theme.palette.primary.contrastText,
    };

    return {
        drawerPaper: {
            position: 'relative',
            width: drawerWidth,
            backgroundColor: theme.palette.primary.main,
            font: theme.palette.primary.contrastText,
        },
        toolbar: theme.mixins.toolbar
    };
};

class VanillaSideDrawer extends React.Component<WithStyles<string>> {

    render() {
        const { classes } = this.props;

        return (
            <Drawer
                variant="permanent"
                classes={{
                    paper: classes.drawerPaper,
                }}
            >
                <div className={classes.toolbar} />
                <List>{mailFolderListItems}</List>
                <Divider />
                <List>{otherMailFolderListItems}</List>
            </Drawer>
        );
    }
}

export default withStyles(styles)(VanillaSideDrawer);