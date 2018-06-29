import * as React from 'react';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import FolderIcon from '@material-ui/icons/Folder';
import CircularProgress from '@material-ui/core/CircularProgress';

type LoadingFolderIconProps = WithStyles<'listItemColor'> & { loading: boolean };

const styles: StyleRulesCallback = theme => ({
    listItemColor: {
        color: theme.palette.primary.contrastText,
        opacity: 0.85,
    }
})

const LoadingFolderIcon: React.StatelessComponent<LoadingFolderIconProps>
    = ({ classes, loading }) => (
        <ListItemIcon>
            {loading
                ? <CircularProgress
                    className={`${classes.listItemColor}`}
                    // Does classes.progress do anything? ${classes.progress} 
                    size={24}
                    thickness={5}
                />
                : <FolderIcon className={classes.listItemColor} />}
        </ListItemIcon>
    );

export default withStyles(styles)(LoadingFolderIcon);