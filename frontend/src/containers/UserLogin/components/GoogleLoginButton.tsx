import * as React from 'react';
import Fade from '@material-ui/core/Fade';
import { GoogleLogin, GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

type GoogleLoginButtonProps = {
    show: boolean,
    loading: boolean,
    onSuccess: (response: GoogleLoginResponse | GoogleLoginResponseOffline) => void,
    onFailure: (response: { error: string }) => void,
    onLoading: () => void,
};

class GoogleLoginButton extends React.Component<GoogleLoginButtonProps> {

    alternateLoginButton = (onClickProp?: { onClick: () => void }) => {
        if (typeof onClickProp === 'undefined') {
            return (
                <Button color="inherit"> Login </Button>
            );
        }

        const onClick = () => {
            onClickProp.onClick();
            this.props.onLoading();
        }

        let buttonContent = <Typography color="inherit" variant="button">Sign in</Typography>;
        if (this.props.loading) {
            buttonContent = <CircularProgress size={14} color="inherit" thickness={6} />;
        }

        return (
            <Button color="inherit" onClick={onClick} disabled={this.props.loading}>
                {buttonContent}
            </Button>
        );
    };

    render() {
        const {show } = this.props;
        const props = this.props;

        return (
            <Fade in={show}>
                <div style={{ display: (show ? 'inline-block': 'none') }}>
                    <GoogleLogin
                        clientId="883053712992-bp84lpgqrdgceasrhvl80m1qi8v2tqe9.apps.googleusercontent.com"
                        onSuccess={props.onSuccess}
                        onFailure={props.onFailure}
                        prompt="select_account" // always prompts user to select a specific account
                        render={this.alternateLoginButton}
                        isSignedIn
                    />
                </div>
            </Fade>
        );
    }

}

export default GoogleLoginButton