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
    open: boolean,
    disabled: boolean,
    toggleFolder: () => void,
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
        const { disabled, toggleFolder, classes } = this.props;

        return (
            <div>
                <div className="fileItem">
                    <ListItem
                        button
                        onClick={toggleFolder}
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
                    <UserFileItems />
                    <NewFileField
                        newFile={this.state.hasNewFileField}
                        deleteFileField={() => { this.setState({ hasNewFileField: false }) }}
                    />
                </List>
            </div>
        );
    }
}
export default ListItemStyles(FilesFolder);