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

type Props = WithStyles<ListItemStylesTypes>;

type State = {
    loggedIn: boolean,
    hasNewFileField: boolean,
};

class SavedIndicator extends React.Component<{}, { isBufferSaved: boolean }> {

    constructor(props: {}) {
        super(props);
        this.state = {
            isBufferSaved: state.isBufferSaved.getValue()
        };
    }

    componentDidMount() {
        state.isBufferSaved.subscribe(x => this.setState({ isBufferSaved: x}));
    }

    render() {
        const text = this.state.isBufferSaved ? 'All Changes Saved' : 'Saving ...';
        return <div style={{color: 'white' }}>{text}</div>;
    }
}

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
        const { classes } = this.props;

        return (
            <div>
                <div className="fileItem">
                    <ListItem
                        disabled={!this.state.loggedIn}
                        dense
                        classes={{ dense: classes.tinyPadding }}>
                        <Button
                            disabled={!this.state.loggedIn}
                            onClick={this.newFileField}>
                            New
                        </Button>
                        <SavedIndicator />
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