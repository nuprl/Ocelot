import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import LoginLogout from './components/LoginLogout';
import { GoogleLoginResponse } from 'react-google-login';
import { logInUserRequest, logOutUser, loadingOngoing, notLoading } from '../../store/userLogin/actions';
import { RootState } from '../../store/';
import { batchActions } from '../../store/batchActions';
import { resetDefaultFiles, closeFilesFolder, openFilesFolder } from '../../store/userFiles/actions';

const mapStateToProps = (state: RootState) => ({
    loggedIn: state.userLogin.loggedIn,
    loading: state.userLogin.loading,
    email: state.userLogin.email,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    onLogin: (googleUser: GoogleLoginResponse) => { dispatch(logInUserRequest(googleUser)); },
    onLogout: () => { 
        dispatch(
            batchActions(
                logOutUser(),
                closeFilesFolder()
            )
        ); 
        dispatch(resetDefaultFiles());
        dispatch(openFilesFolder());
        // Not sure if I should put this here
        localStorage.removeItem('userEmail');
        localStorage.removeItem('sessionId');
    },
    // surround with curly braces so that it does not return what dispatch returns
    onLoading: () => { dispatch(loadingOngoing()); },
    onNotLoading: () => { dispatch(notLoading()); }
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginLogout);