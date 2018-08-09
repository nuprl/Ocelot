import { connect } from 'react-redux';
import { RootState } from '../../store/';
import FilesFolder from './components/FilesFolder';

const mapStateToProps = (state: RootState) => ({
    disabled: state.userFiles.folderInfo.filesLoading
});

export default connect(mapStateToProps)(FilesFolder);