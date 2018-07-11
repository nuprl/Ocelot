import * as React from 'react';
import FileItem from '../../components/FileItem';
import ListItemStyles from 'components/ListItemStyles';
import { ListItemStylesTypes } from 'components/ListItemStyles';
import { WithStyles } from '@material-ui/core';
import { RootState } from 'store';
import { Dispatch } from 'redux';
import { selectFile, deleteFile } from 'store/userFiles/actions';
import { connect } from 'react-redux';

type Props = {
    files: { name: string, content: string }[],
    selectedFileIndex: number,
    fileSaved: boolean[]
    makeHandleClickFile: (index: number) => () => void,
    makeHandleDeleteFile: (index: number, name: string) => () => void,
};

class UserFiles extends React.Component<WithStyles<ListItemStylesTypes> & Props> {

    render() {
        const { files, selectedFileIndex, fileSaved } = this.props;
        return (
            files.map((fileObj: { name: string, content: string }, index: number) => (
                <div
                    className="fileItem"
                    key={`${fileObj.name}${index + 1}`}
                >
                    <FileItem
                        isSelected={selectedFileIndex === index}
                        onSelect={this.props.makeHandleClickFile(index)}
                        onDelete={this.props.makeHandleDeleteFile(index, fileObj.name)}
                        isSaved={fileSaved[index]}
                        name={fileObj.name}
                        key={`${fileObj.name}${index + 2}`}
                    />
                </div>
            ))
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    files: state.userFiles.filesInfo.files,
    selectedFileIndex: state.userFiles.filesInfo.selectedFileIndex,
    fileSaved: state.userFiles.filesInfo.fileSaved,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    makeHandleClickFile: (index: number) => (() => {
        dispatch(selectFile(index));
    }),
    makeHandleDeleteFile: (index: number, name: string) => (() => {
        // index is used for removing the file from store
        // the name is for removing the file from the database
        dispatch(deleteFile(index, name));
    })
});
export default connect(mapStateToProps, mapDispatchToProps)(ListItemStyles(UserFiles));