import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import { GoogleLogin, GoogleLogout, GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fade from '@material-ui/core/Fade';
import Hidden from '@material-ui/core/Hidden';
import ErrorSnackbar from './ErrorSnackbar';

const styles: StyleRulesCallback = theme => ({
    emailText: {
        paddingRight: theme.spacing.unit,
    },
    logoutButton: {
        display: 'inline-block'
    }
});

type State = {
    auth: boolean,
    loading: boolean,
    email: string,
    error: boolean,
    errorMessage: string
};

type LoginButtonProps = {
    onLogin: () => void, // notifies the index (the top parent element that we're logged in)
    onLogout: () => void, // notifies the index (the top parent element that we're logged in)
};

class LoginButton extends React.Component<WithStyles<string> & LoginButtonProps, State> {

    state = {
        auth: false, // for showing user email, login/logout button
        loading: false, // for loading in button
        error: false, // for showing snackbar for error (e.g. server is down)
        email: '', // storing email
        errorMessage: '', // error message of snackbar
    };

    onSuccessResponse = async (googleUser: GoogleLoginResponse) => {
        this.setState({ loading: true });
        this.setState({ email: googleUser.getBasicProfile().getEmail() });
        let id_token = googleUser.getAuthResponse().id_token; // get id token
        let url = 'https://us-central1-umass-compsci220.cloudfunctions.net/paws/login';
        // domain to send post requests to

        if (window.location.host.substring(0, 9) === 'localhost') { // if hosted on localhost
            url = 'http://localhost:8000/login';
        }

        let data: { token: string, sessionId: string | null } = { token: id_token, sessionId: null }; // data to be sent

        const possibleSessionId = localStorage.getItem('sessionId');
        if (possibleSessionId !== null) {
            data.sessionId = possibleSessionId;
        }

        try {
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
                this.setState({
                    loading: false,
                    errorMessage: 'Only students and professors of CS 220 are allowed to log in',
                    error: true,
                });
                return;
            }

            // important: the key here is 'sessionId'
            localStorage.setItem('sessionId', jsonResponse.sessionId);

            this.setState({ loading: false });
            this.setState({ auth: true });
            this.props.onLogin();

        } catch (error) {
            this.setState({
                loading: false,
                errorMessage: 'The authentication server seems to be down. Try again in a bit.',
                error: true
            });
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
        this.setState({ loading: false });
    };

    logout = () => {
        this.setState({ auth: false });
        this.props.onLogout();
    };

    renderLoginButton = (renderProps?: { onClick: () => void }) => {
        if (renderProps !== undefined) {
            return (
                <Button
                    color="inherit"
                    onClick={() => { renderProps.onClick(); this.setState({ loading: true }); }}
                >
                    {this.state.loading ?
                        <CircularProgress size={14} color="inherit" /> :
                        <Typography color="inherit" variant="button">Sign in</Typography>
                    }
                </Button>
            );
        }
        return (
            <Button color="inherit" >Login</Button>
        );
    }

    renderLogoutButton = (renderProps?: { onClick: () => void }) => {
        if (renderProps !== undefined) {
            return (
                <Button
                    color="inherit"
                    onClick={renderProps.onClick}
                    className={this.props.classes.logoutButton}
                >
                    <Typography color="inherit" variant="button">Sign out</Typography>
                </Button>
            );
        }
        return (
            <Button variant="outlined" color="primary">
                Logout
            </Button>
        );
    }

    handleCloseSnackbar = (event: React.SyntheticEvent<any>, reason: string): void => {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({ error: false });
    }
    handleCloseClickSnackbar = (event: React.MouseEvent<HTMLElement>): void => {
        this.setState({ error: false });
    }

    render() {
        const { auth, email, error, errorMessage } = this.state;
        const { classes } = this.props;

        return (
            <div>

                <ErrorSnackbar
                    open={error}
                    handleClose={this.handleCloseSnackbar}
                    handleClick={this.handleCloseClickSnackbar}
                    message={errorMessage}
                />
                <Hidden xsDown>

                    <Fade in={auth} {...(auth ? { timeout: 500 } : {})}>
                        <div
                            className={classes.emailText}
                            style={{ display: (auth ? 'inline-block' : 'none') }}
                        >
                            <Typography variant="subheading" color="inherit">
                                {email}
                            </Typography>
                        </div>
                    </Fade>
                </Hidden>
                <Fade in={auth}>
                    <div style={{ display: (auth ? 'inline-block' : 'none') }}>
                        <GoogleLogout
                            onLogoutSuccess={this.logout}
                            render={this.renderLogoutButton}
                        />
                    </div>
                </Fade>

                <Fade in={!auth}>
                    <div style={{ display: (auth ? 'none' : 'inline-block') }}>
                        <GoogleLogin
                            clientId="883053712992-bp84lpgqrdgceasrhvl80m1qi8v2tqe9.apps.googleusercontent.com"
                            onSuccess={this.onSuccessWrapper}
                            onFailure={this.onFailureResponse}
                            prompt="select_account" // always prompts user to select a specific account
                            render={this.renderLoginButton}
                            isSignedIn
                        />
                    </div>
                </Fade>
            </div >
        );
    }

}

export default withStyles(styles)(LoginButton);