import { call, put, takeEvery } from 'redux-saga/effects';
import { LogInUserRequestAction, LOG_IN_USER_REQUEST } from './types';
import { triggerNotification } from 'store/notification/actions';
import { loadFilesRequest } from '../userFiles/actions';
import { logInUserSuccess, logOutUser } from './actions';
import { batchActions } from 'store/batchActions';

import { validateUserResponse, validateUser } from 'utils/api/validateUser';
import { isFailureResponse } from 'utils/api/apiHelpers';

function* validate(action: LogInUserRequestAction) {
    const response: validateUserResponse = yield call(validateUser, action.googleUser);
    if (isFailureResponse(response)) {
        yield put(batchActions(
            triggerNotification(response.data.message, 'top'),
            logOutUser()
        ));
        return;
    }
    yield put(logInUserSuccess(response.data.email));
    // batching these two actions here would not let Saga know I dispatched a loadFilesRequest
    yield put(loadFilesRequest());
}

export function* watchUserLoginRequest() {
    yield takeEvery(LOG_IN_USER_REQUEST, validate);
}