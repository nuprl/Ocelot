import * as React from 'react';
import { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import Typography from '@material-ui/core/Typography';
import { validateUser } from './utils/api/validateUser';
import { isFailureResponse } from './utils/api/apiHelpers';
import * as state from './state';
import * as utils from './utils';

import Fade from '@material-ui/core/Fade';
import { GoogleLogin, } from 'react-google-login';
import Button from '@material-ui/core/Button';

import { GoogleLogout } from 'react-google-login';
import { connect } from './reactrx';

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

type LoginLogoutState = {
    loggedIn: state.LoggedIn,
    loading: boolean,
}

class LoginLogout extends React.Component<{}, LoginLogoutState> {

    constructor(props: {}) {
        super(props);
        this.state = {
            loggedIn: state.loggedIn.getValue(),
            loading: false
        };
        connect(this, 'loggedIn', state.loggedIn);
    }

    onSuccess(response: GoogleLoginResponse | GoogleLoginResponseOffline) {
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
        utils.postJson('listfiles', { })
            .then(files => {
                state.files.next(files);
                const email = state.email();
                if (email === false) {
                    throw new Error('Race condition--immediate logout');
                }
                state.loggedIn.next({ kind: 'logged-in', email  });
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
    }

    render() {
        const loggedIn = this.state.loggedIn.kind !== 'logged-out';
        const email = this.state.loggedIn.kind !== 'logged-out' ? this.state.loggedIn.email : '';
        return (
            <div>
                <Typography style={{display: loggedIn ? "inline" : "none" }} variant="subheading" color="inherit">
                    {email}
                </Typography>
                <GoogleLogoutButton show={loggedIn} onClick={() => this.onLogout()} />
                <GoogleLogin
                        style={{display: loggedIn ? "none" : "" }}
                        clientId="692270598994-p92ku4bbjkvcddouh578eb1a07s8mghc.apps.googleusercontent.com"
                        onSuccess={(resp) => this.onSuccess(resp)}
                        onFailure={this.onFailure}
                        prompt="select_account" // always prompts user to select a specific account
                        isSignedIn
                    />
            </div >
        );
    }

}


export default LoginLogout;