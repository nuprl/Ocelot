import { call, put, takeEvery } from 'redux-saga/effects';
import { UserLoginAction } from './constants';
import { triggerErrorNotification } from './../ErrorNotification/actions';
import { loginUserSuccess } from './actions';
import { LOG_IN_USER_REQUEST } from './actionTypes';

import * as Api from './api/validateUser';

function* validateUser(action: UserLoginAction) {
    const response: Api.validateUserResponse = yield call(Api.validateUser, action.googleUser!);
    if (response.status === 'FAILURE') {
        yield put(triggerErrorNotification(response.data.message!));
        // TODO: I need to dispatch (put) a LOG IN FAILURE to stop the UI loading
        return;
    }
    yield put(loginUserSuccess(response.data.email!));
}

export function* watchUserLoginRequest() {
    yield takeEvery(LOG_IN_USER_REQUEST, validateUser);
}