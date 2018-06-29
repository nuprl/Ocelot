import * as React from 'react';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import ListItemButton from './components/ListItemButton'
import StarBorderIcon from '@material-ui/icons/StarBorder';
import FilesFolderList from 'containers/FilesFolderList';

const styles: StyleRulesCallback = theme => ({
    drawerPaper: {
        position: 'relative',
        width: '100%',
        backgroundColor: theme.palette.primary.main,
        overflow: 'hidden'
    },
    toolbar: theme.mixins.toolbar,
});

type Styles = 'drawerPaper' | 'toolbar'

const SideDrawer: React.StatelessComponent<WithStyles<Styles>> = (
    { classes }
) => (
        <Drawer
            variant="permanent"
            anchor="left"
            classes={{
                paper: classes.drawerPaper,
            }}
        >
            <div className={classes.toolbar} />
            <List dense>
                <FilesFolderList />
            </List>
            <List dense>
                <ListItemButton
                    icon={<StarBorderIcon />}
                    text="CS 220"
                />
            </List>
        </Drawer>
    );

export default withStyles(styles)(SideDrawer);