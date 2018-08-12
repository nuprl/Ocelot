import * as React from 'react';
import FileItem from '../../components/FileItem';
import ListItemStyles from '../../../../components/ListItemStyles';
import { ListItemStylesTypes } from '../../../../components/ListItemStyles';
import { WithStyles } from '@material-ui/core';
import { RootState } from '../../../../store';
import { connect } from 'react-redux';

type Props = {
    userFilesInfo: {
        files: { name: string, content: string }[],
        selectedFileIndex: number,
    },
    loggedIn: boolean,
    makeHandleClickFile: (index: number) => () => void,
    makeHandleDeleteFile: (index: number, name: string, loggedIn: boolean) => () => void,
};

class UserFiles extends React.Component<WithStyles<ListItemStylesTypes> & Props> {

    render() {

        
        const { userFilesInfo, loggedIn } = this.props;
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

const mapStateToProps = (state: RootState) => ({
    loggedIn: state.userLogin.loggedIn,
});
export default connect(mapStateToProps)(ListItemStyles(UserFiles));
