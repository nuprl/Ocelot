import * as React from 'react';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import FilesFolderList from './FilesFolderList';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

const styles: StyleRulesCallback = theme => ({
    drawerPaper: {
        position: 'relative',
        width: '100%',
        backgroundColor: theme.palette.primary.main,
        overflow: 'hidden'
    },
    toolbar: theme.mixins.toolbar,
    listItemColor: {
        color: theme.palette.primary.contrastText,
        opacity: 0.85,
    }
});

type SideDrawerProps = {
    loggedIn: boolean,
    createSnackbarError: (message: string) => void,
    onUpdateFiles: (file: { name: string, content: string }[]) => void,
    onDeleteFile: (index: number) => void,
    onSelectFile: (fileIndex: number) => void,
    files: { name: string, content: string }[],
    selectedFileIndex: number,
    onCreatedFile: (fileName: string) => void
    fileSaved: boolean[]
};

class SideDrawer extends React.Component<WithStyles<string> & SideDrawerProps> {

    render() {
        const { loggedIn, classes, files, selectedFileIndex, fileSaved } = this.props;

        return (
            <Drawer
                variant="permanent"
                anchor="left"
                classes={{
                    paper: classes.drawerPaper,
                }}
            >
                <div className={classes.toolbar} />
                {loggedIn &&
                    <List dense>
                        <FilesFolderList
                            createSnackbarError={this.props.createSnackbarError}
                            onUpdateFiles={this.props.onUpdateFiles}
                            onSelectFile={this.props.onSelectFile}
                            onDeleteFile={this.props.onDeleteFile}
                            files={files}
                            selectedFileIndex={selectedFileIndex}
                            onCreatedFile={this.props.onCreatedFile}
                            fileSaved={fileSaved}
                        />
                    </List>}
                {loggedIn && <Divider />}
                <List dense>
                    <ListItem button>
                        <ListItemIcon>
                            <StarBorderIcon className={classes.listItemColor} />
                        </ListItemIcon>
                        <ListItemText
                            disableTypography
                            primary={
                                <Typography variant="subheading" className={classes.listItemColor}>
                                    CS 220
                            </Typography>}
                            classes={{ root: classes.listItemColor }}
                        />
                    </ListItem>
                </List>
            </Drawer>
        );
    }
}

export default withStyles(styles)(SideDrawer);