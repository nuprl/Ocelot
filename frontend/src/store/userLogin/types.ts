import { Action } from 'redux';
import { GoogleLoginResponse } from 'react-google-login';

// Action types
export const LOG_OUT_USER = 'LOG_OUT_USER';
export const LOG_IN_USER_REQUEST = 'LOG_IN_USER_REQUEST';
export const LOG_IN_USER_SUCCESS = 'LOG_IN_USER_SUCCESS';
export const LOADING_ONGOING = 'LOADING_ONGOING';

export interface LogOutUserAction extends Action {
    type: 'LOG_OUT_USER';
}

export interface LogInUserRequestAction extends Action {
    type: 'LOG_IN_USER_REQUEST';
    googleUser: GoogleLoginResponse;
}

export interface LogInUserSuccessAction extends Action {
    type: 'LOG_IN_USER_SUCCESS';
    email: string;
}

export interface LoadingOngoingAction extends Action {
    type: 'LOADING_ONGOING';
}

export type UserLoginActions =
    | LogOutUserAction
    | LogInUserRequestAction
    | LogInUserSuccessAction
    | LoadingOngoingAction;

// State type
export type UserLoginState = {
    loggedIn: boolean,
    loading: boolean,
    email: string,
};