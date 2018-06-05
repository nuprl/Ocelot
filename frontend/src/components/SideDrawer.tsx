import * as React from 'react';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import { MailFolderListItems, otherMailFolderListItems } from './tileData';
import '../styles/SideDrawer.css';

const drawerWidth = 240;

const styles: StyleRulesCallback = theme => ({
    drawerPaper: {
        position: 'relative',
        width: drawerWidth,
        backgroundColor: theme.palette.primary.main,
        font: theme.palette.primary.contrastText,
    },
    toolbar: theme.mixins.toolbar
});

type SideDrawerProps = {
    loggedIn: boolean,
};

class SideDrawer extends React.Component<WithStyles<string> & SideDrawerProps> {

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
                <List dense>
                    <MailFolderListItems />
                </List>
                <Divider />
                <List>{otherMailFolderListItems}</List>
            </Drawer>
        );
    }
}

export default withStyles(styles)(SideDrawer);