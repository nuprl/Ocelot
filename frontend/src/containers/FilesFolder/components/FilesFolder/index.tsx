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
import * as state from '../../../../state';

type FilesFolderProps = {
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
    loggedIn: boolean,
    hasNewFileField: boolean,
};

class FilesFolder extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            loggedIn: false,
            hasNewFileField: false,
        };
    }

    componentDidMount() {
        state.uiActive.subscribe(x => this.setState({ loggedIn: x }));
    }

    newFileField = () => { this.setState({ hasNewFileField: true }) };

    render() {
        const { 
            classes, 
            userFilesInfo, 
            makeHandleDeleteFile, 
            makeHandleClickFile,
            onCreateFile
        } = this.props;

        let loginDisabled = this.state.loggedIn;
        if (!this.state.loggedIn) {
            const mustLogin = window.location.search !== '?anonymous';
            loginDisabled = mustLogin && !this.state.loggedIn;
        }

        return (
            <div>
                <div className="fileItem">
                    <ListItem
                        disabled={loginDisabled}
                        dense
                        classes={{ dense: classes.tinyPadding }}>
                        <Button
                            disabled={loginDisabled}
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