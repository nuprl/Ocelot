import * as t from './actionTypes';
import { UserLoginState, UserLoginAction, UserLoginHandler } from './constants';

const initialState: UserLoginState = {
    loggedIn: false,
    loading: false,
    email: '',
};

const handlers: UserLoginHandler = {
    [t.LOG_IN_USER]: (state, action) => ({
        ...state,
        loggedIn: true,
    }),
    [t.LOG_OUT_USER]: (state, action) => ({
        ...state,
        loggedIn: false,
    }),
    [t.VALIDATE_USER]: (state, action) => ({
        ...state,
        loading: true
    }),
    [t.LOADING_ONGOING]: (state, action) => ({
        ...state,
        loading: true,
    }),
    [t.LOADING_FINISHED]: (state, action) => ({
        ...state,
        loading: false,
    })
}

export function UserLogin(state = initialState, action: UserLoginAction) {
    const handler = handlers[action.type];
    if (typeof handler === 'undefined') {
        return state;
    }
    return handler(state, action);
}