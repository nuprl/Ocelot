import * as React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import 'static/styles/DrawerIconButton.css';
import UserFileItems from '../../containers/UserFileItems';
import NewFileField from '../../containers/NewFileField';
import 'static/styles/DrawerIconButton.css';
import ListItemStyles from '../../../../components/ListItemStyles';
import { ListItemStylesTypes } from '../../../../components/ListItemStyles';
import { WithStyles, Button } from '@material-ui/core';

type FilesFolderProps = {
    disabled: boolean,
    userFilesInfo: {
        files: { name: string, content: string }[],
        selectedFileIndex: number,
    },
    makeHandleDeleteFile: (fileIndex: number, name: string, loggedIn: boolean) => (() => void),
    makeHandleClickFile: (fileIndex: number) => (() => void),
    onCreateFile: (fileName: string, loggedIn: boolean) => void,
};

type Props = FilesFolderProps & WithStyles<ListItemStylesTypes>;

type State = {
    hasNewFileField: boolean,
};

class FilesFolder extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            hasNewFileField: false,
        }
    }

    newFileField = () => { this.setState({ hasNewFileField: true }) };

    render() {
        const { 
            disabled, 
            classes, 
            userFilesInfo, 
            makeHandleDeleteFile, 
            makeHandleClickFile,
            onCreateFile
        } = this.props;

        return (
            <div>
                <div className="fileItem">
                    <ListItem
                        disabled={disabled}
                        dense
                        classes={{ dense: classes.tinyPadding }}>
                        <Button
                            disabled={disabled}
                            onClick={this.newFileField}>
                            New
                        </Button>
                    </ListItem>
                </div>
                <List component="div" disablePadding dense >
                    <UserFileItems 
                        userFilesInfo={userFilesInfo}
                        makeHandleClickFile={makeHandleClickFile}
                        makeHandleDeleteFile={makeHandleDeleteFile}
                    />
                    <NewFileField
                        files={userFilesInfo.files}
                        onCreateFile={onCreateFile}
                        newFile={this.state.hasNewFileField}
                        deleteFileField={() => { this.setState({ hasNewFileField: false }) }}
                    />
                </List>
            </div>
        );
    }
}
export default ListItemStyles(FilesFolder);