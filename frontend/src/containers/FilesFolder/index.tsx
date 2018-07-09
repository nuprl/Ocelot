import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { createNewFileField } from 'store/userFiles/actions';
import { RootState } from 'store/';
import FilesFolder from './components/FilesFolder';

const mapStateToProps = (state: RootState) => ({
    disabled: state.userFiles.folderInfo.filesLoading
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    onCreateFile: () => { dispatch(createNewFileField()); }
});

export default connect(mapStateToProps, mapDispatchToProps)(FilesFolder);