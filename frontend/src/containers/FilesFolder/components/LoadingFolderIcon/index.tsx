import * as React from 'react';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import FolderIcon from '@material-ui/icons/Folder';
import CircularProgress from '@material-ui/core/CircularProgress';

type LoadingFolderIconProps = { loading: boolean, className: string };

const LoadingFolderIcon: React.StatelessComponent<LoadingFolderIconProps>
    = ({ loading, className }) => (
        <ListItemIcon>
            {loading
                ? <CircularProgress
                    className={`${className}`}
                    // Does classes.progress do anything? ${classes.progress} 
                    size={24}
                    thickness={4}
                />
                : <FolderIcon className={className} />}
        </ListItemIcon>
    );

export default LoadingFolderIcon;