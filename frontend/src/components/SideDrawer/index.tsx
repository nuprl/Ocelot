import * as React from 'react';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import FilesFolder from '../../containers/FilesFolder';

const styles: StyleRulesCallback = theme => ({
    drawerPaper: {
        position: 'relative',
        width: '100%',
        backgroundColor: theme.palette.primary.main,
        overflow: 'hidden'
    },
    toolbar: theme.mixins.toolbar,
    noBorder: {
        borderRight: 'none'
    }
});

type Styles = 'drawerPaper' | 'toolbar' | 'noBorder';

type Props = {
    userFilesInfo: {
        files: { name: string, content: string }[],
        selectedFileIndex: number,
    },
    makeHandleClickFile: (fileIndex: number) => (() => void),
    makeHandleDeleteFile: (fileIndex: number, name: string, loggedIn: boolean) => (() => void),
    onCreateFile: (fileName: string, loggedIn: boolean) => void,
}

const SideDrawer: React.StatelessComponent<WithStyles<Styles> & Props> = (
    { classes, userFilesInfo, makeHandleClickFile, makeHandleDeleteFile, onCreateFile }
) => (
        <Drawer
            variant="permanent"
            anchor="left"
            classes={{
                paper: classes.drawerPaper,
                paperAnchorDockedLeft: classes.noBorder
            }}
        >
            <div className={classes.toolbar} style={{minHeight: '48px'}}/>
            {/* Setting toolbar is so hacky, I don't know how to override it */}
            <List dense>
                <FilesFolder 
                    userFilesInfo={userFilesInfo}
                    makeHandleClickFile={makeHandleClickFile}
                    makeHandleDeleteFile={makeHandleDeleteFile}
                    onCreateFile={onCreateFile}
                />
            </List>
        </Drawer>
    );

export default withStyles(styles)(SideDrawer);