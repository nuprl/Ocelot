import * as React from 'react';
import Fade from '@material-ui/core/Fade';
import Button from '@material-ui/core/Button';
import { GoogleLogout } from 'react-google-login';
import Typography from '@material-ui/core/Typography';
/**
 * An alternate log out button for logging out
 * This overrides the default given by react-google-login
 * @param {{ onClick: () => void }} [onClickProp]
 * @returns {React.ReactNode}
 */
const alternateLogoutButton = (onClickProp?: { onClick: () => void }) => {
    if (typeof onClickProp === 'undefined') {
        return (<Button color="inherit">Sign out</Button>);
    }
    return (
        <Button color="inherit" onClick={onClickProp.onClick}>
            <Typography color="inherit" variant="button">Sign out</Typography>
        </Button>
    );
}

type GoogleLogoutButtonProps = {
    show: boolean, // whether to show it or not 
    onLogout: () => void, // when logging out
}
/**
 * A GoogleLogoutButton (a stateless component)
 *
 * @param {GoogleLogoutButtonProps} props
 * @returns {JSX.Element} a Logout btton
 */
function GoogleLogoutButton(props: GoogleLogoutButtonProps): JSX.Element {
    const { show } = props;
    return (
        <Fade in={show}>
            <div style={{ display: (show ? 'inline-block' : 'none') }}>
                <GoogleLogout
                    onLogoutSuccess={props.onLogout}
                    render={alternateLogoutButton}
                />
            </div>
        </Fade>
    );
}

export default GoogleLogoutButton;