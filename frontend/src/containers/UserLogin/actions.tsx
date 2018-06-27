import * as t from './actionTypes'
import { GoogleLoginResponse } from 'react-google-login';

export const logoutUser = () => ({
    type: t.LOG_OUT_USER
})

export const loginUser = () => ({
    type: t.LOG_IN_USER
})

export function validateUser(googleUser: GoogleLoginResponse) {
    return {
        type: t.VALIDATE_USER,
        googleUser: googleUser
    }
}

export const loadingOngoing = () => ({
    type: t.LOADING_ONGOING
})

export const loadingFinished = () => ({
    type: t.LOADING_FINISHED
})