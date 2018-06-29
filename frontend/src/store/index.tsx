import { combineReducers, Reducer } from 'redux';

import { ErrorNotificationState } from './errorNotification/types';
import { UserLoginState } from './userLogin/types';
import errorNotificationReducer from './errorNotification/reducer';
import userLoginReducer from './userLogin/reducer';

import { all } from 'redux-saga/effects';
import { watchUserLoginRequest } from './userLogin/saga';

export interface RootState {
    errorNotification: ErrorNotificationState;
    userLogin: UserLoginState;
}

export const rootReducer: Reducer<RootState> = combineReducers<RootState>({
    errorNotification: errorNotificationReducer,
    userLogin: userLoginReducer
});

export function* rootSaga() {
    yield all([
        watchUserLoginRequest(),
    ]);
}