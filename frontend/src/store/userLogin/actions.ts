import * as t from './types'
import { ActionCreator } from 'redux';
import { GoogleLoginResponse } from 'react-google-login';

export const logoutUser: ActionCreator<t.LogOutUserAction>
    = () => ({
        type: t.LOG_OUT_USER
    });

export const loginUserRequest: ActionCreator<t.LogInUserRequestAction>
    = (googleUser: GoogleLoginResponse) => ({
        type: t.LOG_IN_USER_REQUEST,
        googleUser: googleUser
    });

export const loginUserSuccess: ActionCreator<t.LogInUserSuccessAction>
    = (email: string) => ({
        type: t.LOG_IN_USER_SUCCESS,
        email: email
    });

export const loadingOngoing: ActionCreator<t.LoadingOngoingAction>
    = () => ({
        type: t.LOADING_ONGOING
    });