import * as React from 'react';
import { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import Typography from '@material-ui/core/Typography';
import { validateUser } from './utils/api/validateUser';
import { isFailureResponse } from './utils/api/apiHelpers';
import * as state from './state';
import * as utils from './utils';
import { Sandbox } from './sandbox';
import { LOGIN_CLIENT_ID } from './secrets';

import Fade from '@material-ui/core/Fade';
import { GoogleLogin } from 'react-google-login';
import Button from '@material-ui/core/Button';

import { GoogleLogout } from 'react-google-login';
import { connect } from './reactrx';

import './static/styles/body.css';

const alternateLogoutButton = (onClickProp?: { onClick: () => void }) => {
    return !onClickProp ? (<Button color="inherit">Logout</Button>) : (
        <Button color="inherit" onClick={onClickProp.onClick}>
            <Typography color="inherit" variant="button">Sign Out</Typography>
        </Button>
    );
}, alternateLoginButton = (onClickProp? : {onClick: () => void}) => {
    return !onClickProp ? (<Button color="inherit">Login</Button>) : (
        <Button color="inherit" onClick={onClickProp.onClick}>
            <Typography color="inherit" variant="button">Login with Google</Typography>
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

type SandboxProps = {
    sandbox: Sandbox
}

type LoginLogoutState = {
    loggedIn: state.LoggedIn,
    loading: boolean,
}

class LoginLogout extends React.Component<SandboxProps, LoginLogoutState> {

    constructor(props: SandboxProps) {
        super(props);
        this.state = {
            loggedIn: state.loggedIn.getValue(),
            loading: false
        };
        connect(this, 'loggedIn', state.loggedIn);
    }

    onSuccess(response: GoogleLoginResponse | GoogleLoginResponseOffline) {
        if (state.githubGist.getValue() !== 'no-gist' && localStorage.getItem('userEmail') !== null) {
            // if there is gist (or an attempt) and user is logged in before...
            state.githubGist.next('no-gist');
            return; // this prevents auto log in
        }

        validateUser(response as GoogleLoginResponse).then((response) => {
            if (isFailureResponse(response)) {
                state.notify(response.data.message);
                this.onLogout();
                return;
            }
            state.loggedIn.next({
                kind: 'loading-files',
                email: response.data.email
            });
            this.loadFiles();

        }).catch(error => {
            state.notify('Could not log in. Check again');
            this.loadFiles();
        });
    }

    loadFiles = () => {
        utils.postJson('listfiles', {})
            .then(files => {
                state.files.next(files);
                const email = state.email();
                if (email === false) { // This case is hit if user immediately logs out after logging in.
                    this.onLogout();
                    return;
                }
                this.props.sandbox.setWS();
                state.loggedIn.next({ kind: 'logged-in', email });
                state.loadProgram.next({ kind: "nothing"});
            })
            .catch(reason =>
                // TODO(arjun): Perhaps just retry?
                    state.notify(`Could not load files`));
    }

    onFailure = (response: { error: string }) => {
        state.notification.next({ message: response.error, position: 'top' });
        this.onLogout();
    }

    onLogout() {
        state.loggedIn.next({ kind: 'logged-out' });
        state.files.next([ state.emptyFile.name ]);
        state.loadProgram.next({ kind: "program", ...state.emptyFile });
        localStorage.removeItem('userEmail');
        localStorage.removeItem('sessionId');
        this.props.sandbox.setWS();
    }

    render() {
        const loggedIn = this.state.loggedIn.kind !== 'logged-out';
        const email = this.state.loggedIn.kind !== 'logged-out' ? this.state.loggedIn.email : '';
        return (
            [
                <Typography key="email" id={loggedIn ? "userEmail" : "" } variant="subheading" color="inherit">
                    {email}
                </Typography>,
                <GoogleLogoutButton key="logout" show={loggedIn} onClick={() => this.onLogout()} />,
                <GoogleLogin key="login"
                        style={{display: loggedIn ? 'none' : ''}}
                        clientId={LOGIN_CLIENT_ID}
                        onSuccess={(resp) => this.onSuccess(resp)}
                        onFailure={this.onFailure}
                        prompt="select_account" // always prompts user to select a specific account
                        isSignedIn
                        render={!loggedIn ? alternateLoginButton : undefined}
                    />
            ]
        );
    }

}


export default LoginLogout;
