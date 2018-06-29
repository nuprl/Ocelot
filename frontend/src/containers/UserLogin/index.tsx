import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import LoginLogout from './components/LoginLogout';
import { GoogleLoginResponse } from 'react-google-login';
import { logInUserRequest, logOutUser, loadingOngoing } from 'store/userLogin/actions';

const mapStateToProps = (state: any) => ({
    loggedIn: state.userLogin.loggedIn,
    loading: state.userLogin.loading,
    email: state.userLogin.email,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    onLogin: (googleUser: GoogleLoginResponse) => { dispatch(logInUserRequest(googleUser)); },
    onLogout: () => { dispatch(logOutUser()); },
    // surround with curly braces so that it does not return what dispatch returns
    onLoading: () => { dispatch(loadingOngoing()); },
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginLogout);