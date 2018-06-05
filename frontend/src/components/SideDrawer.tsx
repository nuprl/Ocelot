import * as React from 'react';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import FilesFolderList from './FilesFolderList';
import { otherMailFolderListItems } from './tileData';

import '../styles/SideDrawer.css';

export const drawerWidth = 240;

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

    getUserFiles = () => {
        
    };

    render() {
        const { classes, loggedIn } = this.props;
        let fileFolderComponent = <FilesFolderList />;

        if (loggedIn) {
            // make some request for files
        }

        return (
            <Drawer
                variant="persistent"
                open={loggedIn}
                anchor="left"
                classes={{
                    paper: classes.drawerPaper,
                }}
            >
                <div className={classes.toolbar} />
                <List dense>
                    {fileFolderComponent}
                </List>
                <Divider />
                <List dense>{otherMailFolderListItems}</List>
            </Drawer>
        );
    }
}

export default withStyles(styles)(SideDrawer);