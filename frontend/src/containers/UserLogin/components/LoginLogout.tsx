import * as React from 'react';
import { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import EmailText from './EmailText';
import GoogleLogoutButton from './GoogleLogoutButton';
import GoogleLoginButton from './GoogleLoginButton';
import { validateUser } from '../../../utils/api/validateUser';
import { isFailureResponse } from '../../../utils/api/apiHelpers';
import { getUserFiles } from '../../../utils/api/getUserFiles';

type LoginLogoutProps = {
    loggedIn: boolean,
    loading: boolean,
    email: string,
    onLogin: (response: GoogleLoginResponse) => void,
    onLogout: () => void,
    onLoading: () => void,
    onNotLoading: () => void,
    setFiles: (userFiles: {name: string, content: string}[]) => void,
    loadFilesSuccess: () => void,
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
            this.props.loadFilesSuccess();
        });
    }

    onFailure = (response: { error: string }) => {
        // this.props.onLogout(); // need a better way to have less logic in this module
        // there's way too much logic embedded for a presentational component
        this.props.onNotLoading();
    }

    render() {
        const { loggedIn, email, loading } = this.props;
        const props = this.props;

        return (
            <div>
                <EmailText show={loggedIn} email={email} />
                <GoogleLogoutButton show={loggedIn} onClick={this.props.onLogout} />
                <GoogleLoginButton
                    show={!loggedIn}
                    loading={loading}
                    onSuccess={this.onSuccess}
                    onFailure={this.onFailure}
                    onClick={props.onLoading}
                />
            </div >
        );
    }

}

export default LoginLogout;