import * as React from 'react';
import FileItem from '../../components/FileItem';
import ListItemStyles from '../../../../components/ListItemStyles';
import { ListItemStylesTypes } from '../../../../components/ListItemStyles';
import { WithStyles } from '@material-ui/core';
import * as state from '../../../../state';

type Props = WithStyles<ListItemStylesTypes>;

class UserFiles extends React.Component<Props, { files: state.UserFile[], loggedIn: boolean }> {

    constructor(props: Props) {
        super(props);
        this.state = {
            loggedIn: false,
            files: state.files.getValue(),
        };
    }

    componentDidMount() {
        state.uiActive.subscribe(x => this.setState({ loggedIn: x }));
        state.files.subscribe(x => this.setState({ files: x }));
    }

    render() {
        const { files, loggedIn } = this.state;
        let disabled = !loggedIn;
        return (
            files.map((fileObj: { name: string, content: string }, index: number) => (
                <div
                    className="fileItem"
                    key={`${fileObj.name}${index + 1}`}
                >
                    <FileItem
                        fileIndex={index}
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
