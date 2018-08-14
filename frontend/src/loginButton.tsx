import * as React from 'react';
import { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import Typography from '@material-ui/core/Typography';
import { validateUser } from './utils/api/validateUser';
import { isFailureResponse } from './utils/api/apiHelpers';
import { getUserFiles } from './utils/api/getUserFiles';
import * as state from './state';

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

type LoginLogoutState = {
    loggedIn: boolean,
    loading: boolean,
    email: string
}

class LoginLogout extends React.Component<{}, LoginLogoutState> {

    constructor(props: {}) {
        super(props);
        this.state = {
            loggedIn: state.loggedIn.getValue(),
            loading: false,
            email: state.email.getValue()
        };
    }
    
    componentDidMount() {
        state.loggedIn.subscribe(x => this.setState({ loggedIn: x }));
        state.email.subscribe(x => this.setState({ email: x }));
    }

    onSuccess = (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
        validateUser(response as GoogleLoginResponse).then((response) => {
            if (isFailureResponse(response)) {
                console.log(response.data.message)
                return;
            }
            state.loggedIn.next(true);
            state.email.next(response.data.email);
            state.filesLoading.next(true);
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
            state.files.next(response.data.userFiles);
            state.selectedFileIndex.next(-1);
        });
    }

    onFailure = (response: { error: string }) => {
        state.notification.next({ message: response.error, position: 'top' });
        this.onLogout();
    }

    onLogout() {
        state.loggedIn.next(false);
        state.email.next('');
        state.files.next([ state.emptyFile ]);
        state.selectedFileIndex.next(1);
        state.isBufferSaved.next(true);
        localStorage.removeItem('userEmail');
        localStorage.removeItem('sessionId');
    }

    render() {
        const { loggedIn, email } = this.state;
        return (
            <div>
                <Typography style={{display: loggedIn ? "inline" : "none" }} variant="subheading" color="inherit">
                    {email}
                </Typography>
                <GoogleLogoutButton show={loggedIn} onClick={() => this.onLogout()} />
                <GoogleLogin
                        style={{display: loggedIn ? "none" : "" }}
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


export default LoginLogout;