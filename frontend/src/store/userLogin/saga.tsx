import { call, put, takeEvery } from 'redux-saga/effects';
import { LogInUserRequestAction, LOG_IN_USER_REQUEST } from './types';
import { triggerErrorNotification } from 'store/errorNotification/actions';
import { logInUserSuccess } from './actions';

import * as Api from './api/validateUser';

function* validateUser(action: LogInUserRequestAction) {
    const response: Api.validateUserResponse = yield call(Api.validateUser, action.googleUser);
    if (Api.isFailureResponse(response)) {
        yield put(triggerErrorNotification(response.data.message));
        // TODO: I need to dispatch (put) a LOG IN FAILURE to stop the UI loading
        return;
    }
    yield put(logInUserSuccess(response.data.email));
}

export function* watchUserLoginRequest() {
    yield takeEvery(LOG_IN_USER_REQUEST, validateUser);
}