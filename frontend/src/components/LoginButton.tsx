import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { GoogleLogin, GoogleLogout, GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import CircularProgress from '@material-ui/core/CircularProgress';

type State = {
    auth: boolean
    loading: boolean
};

class LoginButton extends React.Component<{}, State> {

    state = {
        auth: false,
        loading: false
    };

    onSuccessResponse = async (googleUser: GoogleLoginResponse) => {
        // tslint:disable-next-line:no-console
        console.log(googleUser.getBasicProfile().getName());
        let id_token = googleUser.getAuthResponse().id_token; // get id token
        let url = 'https://us-central1-umass-compsci220.cloudfunctions.net/paws/login';
        // domain to send post requests to

        if (window.location.host.substring(0, 9) === 'localhost') { // if hosted on localhost
            url = 'http://localhost:8000/login';
        }

        const data = { token: id_token }; // data to be sent

        try {
            // tslint:disable-next-line:no-console
            console.log('Getting response...'); // probably loading screen here to tell user to wait

            const response = await fetch(url, { // send json data to specified URL
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const jsonResponse = await response.json(); // get json response

            if (jsonResponse.message === 'Unauthorized') { // if messaged back as unauthorized
                googleUser.disconnect(); // sign user out (revoke given permissions)
                this.setState({ loading: false });
                // tslint:disable-next-line:no-console
                console.log('No can do dude');
                return;
            }

            localStorage.setItem('session', jsonResponse.session);
            // tslint:disable-next-line:no-console
            console.log(`You're logged in!`); // if not, they are logged in
            this.setState({ auth: true });
            this.setState({ loading: false });

        } catch (error) {
            // tslint:disable-next-line:no-console
            console.error('Error', error);
            this.setState({ loading: false });
            googleUser.disconnect();
        }
    };

    onSuccessWrapper = (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
        this.onSuccessResponse(response as GoogleLoginResponse)
            .catch(reason => {
                // tslint:disable-next-line:no-console
                console.error(reason);
            });
    };

    onFailureResponse = (response: { error: string }) => {
        // tslint:disable-next-line:no-console
        console.log(response.error);
        // tslint:disable-next-line:no-console
        this.setState({ loading: false });
    };

    logout = () => {
        // tslint:disable-next-line:no-console
        console.log('You\'re logged out!');
        this.setState({ auth: false });
    };

    renderButton = (renderProps?: { onClick: () => void }) => {
        if (renderProps !== undefined) {
            return (
                <Button color="inherit" onClick={() => { renderProps.onClick(); this.setState({ loading: true }); }}>
                    {this.state.loading ?
                        <CircularProgress size={14} color="inherit" /> :
                        <Typography color="inherit">Login</Typography>
                    }
                </Button>
            );
        }
        return (
            <Button color="inherit" >Login</Button>
        );
    }

    render() {
        const { auth } = this.state;

        return (
            <div>
                {auth ? (
                    <div>
                        <GoogleLogout // this button needs fixing
                            onLogoutSuccess={this.logout}
                            buttonText="Logout"
                        />
                        <Typography color="inherit">
                            You're logged in BOI!
                            </Typography>
                    </div>
                ) : (
                        <GoogleLogin
                            clientId="883053712992-bp84lpgqrdgceasrhvl80m1qi8v2tqe9.apps.googleusercontent.com"
                            onSuccess={this.onSuccessWrapper}
                            onFailure={this.onFailureResponse}
                            prompt="select_account" // always prompts user to select a specific account
                            render={this.renderButton}
                            isSignedIn
                        />
                    )}
            </div>
        );
    }

}

export default LoginButton;