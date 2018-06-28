import { combineReducers, Reducer } from 'redux';

import { ErrorNotificationState } from './errorNotification/types';
import { UserLoginState } from './userLogin/types';
import errorNotificationReducer from './errorNotification/reducer';
import userLoginReducer from './userLogin/reducer';

export interface RootState {
    errorNotification: ErrorNotificationState;
    userLogin: UserLoginState;
}

export const rootReducer: Reducer<RootState>
    = combineReducers<RootState>({
        errorNotification: errorNotificationReducer,
        userLogin: userLoginReducer
    })