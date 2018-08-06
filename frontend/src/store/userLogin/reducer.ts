import * as t from './types';
import { Reducer } from 'redux';

const initialState: t.UserLoginState = {
    loggedIn: false,
    loading: false,
    email: '',
};

const userLogin: Reducer<t.UserLoginState> = (
    state: t.UserLoginState = initialState,
    action: t.UserLoginActions): t.UserLoginState => {
    switch (action.type) {
        case t.LOG_OUT_USER:
            return {
                loggedIn: false,
                loading: false,
                email: '',
            };
        case t.LOG_IN_USER_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case t.LOG_IN_USER_SUCCESS:
            return {
                loading: false,
                email: action.email,
                loggedIn: true,
            };
        case t.LOADING_ONGOING:
            return {
                ...state,
                loading: true
            };
        case t.NOT_LOADING:
            return {
                ...state,
                loading: false,
            };
        default:
            return state;
    }
};

export default userLogin;