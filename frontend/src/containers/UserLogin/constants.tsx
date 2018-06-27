import { GoogleLoginResponse } from 'react-google-login';

export type UserLoginAction = {
    type: string,
    googleUser?: GoogleLoginResponse
};

export type UserLoginState = {
    loggedIn: boolean,
    loading: boolean,
    email: string,
};

export type UserLoginReduceHandler =
    (state: UserLoginState, action: UserLoginAction) => UserLoginState;

export type UserLoginHandler = {
    [key: string]: UserLoginReduceHandler
}