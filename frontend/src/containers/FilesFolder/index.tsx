import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { toggleFilesFolder } from 'store/userFiles/actions';
import { RootState } from 'store/';
import FilesFolder from './components/FilesFolder';

const mapStateToProps = (state: RootState) => ({
    open: state.userFiles.folderInfo.open,
    disabled: state.userFiles.folderInfo.filesLoading
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    toggleFolder: () => { dispatch(toggleFilesFolder()); }
});

export default connect(mapStateToProps, mapDispatchToProps)(FilesFolder);