import * as React from 'react';
import { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import EmailText from './EmailText';
import GoogleLogoutButton from './GoogleLogoutButton';
import GoogleLoginButton from './GoogleLoginButton';

type LoginLogoutProps = {
    loggedIn: boolean,
    loading: boolean,
    email: string,
    onLogin: (googleUser: GoogleLoginResponse) => void,
    onLogout: () => void,
    onLoading: () => void,
};

class LoginLogout extends React.Component<LoginLogoutProps> {

    onSuccess = (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
        this.props.onLogin(response as GoogleLoginResponse);
    }

    onFailure = (response: { error: string }) => {
        this.props.onLogout(); // need a better way to have less logic in this module
        // there's way too much logic embedded for a presentational component
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