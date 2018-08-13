import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { logInUserRequest, logOutUser, loadingOngoing, notLoading } from './store/userLogin/actions';
import { RootState } from './store/';
import { resetDefaultFiles } from './store/userFiles/actions';
import * as React from 'react';
import { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import Typography from '@material-ui/core/Typography';
import { validateUser } from './utils/api/validateUser';
import { isFailureResponse } from './utils/api/apiHelpers';
import { getUserFiles } from './utils/api/getUserFiles';

import Fade from '@material-ui/core/Fade';
import { GoogleLogin, } from 'react-google-login';
import Button from '@material-ui/core/Button';

import { GoogleLogout } from 'react-google-login';

const alternateLogoutButton = (onClickProp?: { onClick: () => void }) => {
    if (typeof onClickProp === 'undefined') {
        return (<Button color="inherit">Logout</Button>);
    }
    return (
        <Button color="inherit" onClick={onClickProp.onClick}>
            <Typography color="inherit" variant="button">Sign out</Typography>
        </Button>
    );
};

type GoogleLogoutButtonProps = {
    show: boolean, // whether to show it or not 
    onClick: () => void, // when they press log out button
};
/**
 * A GoogleLogoutButton (a stateless component)
 *
 * @param {GoogleLogoutButtonProps} props
 * @returns {JSX.Element} a Logout button
 */
function GoogleLogoutButton(props: GoogleLogoutButtonProps): JSX.Element {
    const { show } = props;
    return (
        <Fade in={show}>
            <div style={{ display: (show ? 'inline-block' : 'none') }}>
                <GoogleLogout
                    onLogoutSuccess={props.onClick}
                    render={alternateLogoutButton}
                />
            </div>
        </Fade>
    );
}

type LoginLogoutProps = {
    loggedIn: boolean,
    loading: boolean,
    email: string,
    onLogin: (response: GoogleLoginResponse) => void,
    onLogout: () => void,
    onLoading: () => void,
    onNotLoading: () => void,
    setFiles: (userFiles: {name: string, content: string}[]) => void,
};

class LoginLogout extends React.Component<LoginLogoutProps> {

    onSuccess = (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
        this.props.onLogin(response as GoogleLoginResponse);
        validateUser(response as GoogleLoginResponse).then((response) => {
            if (isFailureResponse(response)) {
                console.log(response.data.message)
                return;
            }

            this.loadFiles();

        }).catch(error => {
            console.log('Could not validate user', error);
        });
    }

    loadFiles = () => {
        getUserFiles().then(response => {
            if (isFailureResponse(response)) {
                console.log('Could not get files');
                return;
            }
            this.props.setFiles(response.data.userFiles);
        });
    }

    onFailure = (response: { error: string }) => {
        // this.props.onLogout(); // need a better way to have less logic in this module
        // there's way too much logic embedded for a presentational component
        this.props.onNotLoading();
    }

    render() {
        const { loggedIn, email } = this.props;
        return (
            <div>
                <Typography style={{display: loggedIn ? "" : "none" }} variant="subheading" color="inherit">
                    {email}
                </Typography>
                <GoogleLogoutButton show={loggedIn} onClick={this.props.onLogout} />
                <GoogleLogin
                        clientId="692270598994-p92ku4bbjkvcddouh578eb1a07s8mghc.apps.googleusercontent.com"
                        onSuccess={this.onSuccess}
                        onFailure={this.onFailure}
                        prompt="select_account" // always prompts user to select a specific account
                        isSignedIn
                    />
            </div >
        );
    }

}

const mapStateToProps = (state: RootState) => ({
    loggedIn: state.userLogin.loggedIn,
    loading: state.userLogin.loading,
    email: state.userLogin.email,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    onLogin: (googleUser: GoogleLoginResponse) => { dispatch(logInUserRequest(googleUser)); },
    onLogout: () => { 
        dispatch(logOutUser()); 
        dispatch(resetDefaultFiles());
        // Not sure if I should put this here
        localStorage.removeItem('userEmail');
        localStorage.removeItem('sessionId');
    },
    // surround with curly braces so that it does not return what dispatch returns
    onLoading: () => { dispatch(loadingOngoing()); },
    onNotLoading: () => { dispatch(notLoading()); }
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginLogout);