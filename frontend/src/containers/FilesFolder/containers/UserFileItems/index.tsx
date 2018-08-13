import * as React from 'react';
import FileItem from '../../components/FileItem';
import ListItemStyles from '../../../../components/ListItemStyles';
import { ListItemStylesTypes } from '../../../../components/ListItemStyles';
import { WithStyles } from '@material-ui/core';
import * as state from '../../../../state';

type Props = WithStyles<ListItemStylesTypes> & {
    userFilesInfo: {
        files: { name: string, content: string }[],
        selectedFileIndex: number,
    },
    makeHandleClickFile: (index: number) => () => void,
    makeHandleDeleteFile: (index: number, name: string, loggedIn: boolean) => () => void,
};

class UserFiles extends React.Component<Props, { loggedIn: boolean }> {

    constructor(props: Props) {
        super(props);
        this.state = { loggedIn: false };
    }

    componentDidMount() {
        state.uiActive.subscribe(x => this.setState({ loggedIn: x }));
    }

    render() {

        
        const { userFilesInfo } = this.props;
        const loggedIn = this.state.loggedIn;
        const { files, selectedFileIndex, } = userFilesInfo;
        let disabled = false;
        if (!loggedIn) {
            const mustLogin = window.location.search !== '?anonymous';
            disabled = mustLogin && !loggedIn;
        }
        return (
            files.map((fileObj: { name: string, content: string }, index: number) => (
                <div
                    className="fileItem"
                    key={`${fileObj.name}${index + 1}`}
                >
                    <FileItem
                        isSelected={selectedFileIndex === index}
                        onSelect={this.props.makeHandleClickFile(index)}
                        onDelete={this.props.makeHandleDeleteFile(index, fileObj.name, loggedIn)}
                        name={fileObj.name}
                        key={`${fileObj.name}${index + 2}`}
                        disabled={disabled}
                    />
                </div>
            ))
        );
    }
}

export default ListItemStyles(UserFiles);
