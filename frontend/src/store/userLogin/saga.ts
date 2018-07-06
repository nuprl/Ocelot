import { call, put, takeEvery } from 'redux-saga/effects';
import { LogInUserRequestAction, LOG_IN_USER_REQUEST } from './types';
import { triggerErrorNotification } from 'store/errorNotification/actions';
import { loadFilesRequest } from '../userFiles/actions';
import { logInUserSuccess, logOutUser } from './actions';
import { batchActions } from 'store/batchActions';

import * as Api from 'containers/UserLogin/Api';

function* validateUser(action: LogInUserRequestAction) {
    const response: Api.validateUserResponse = yield call(Api.validateUser, action.googleUser);
    if (Api.isFailureResponse(response)) {
        yield put(batchActions(
            triggerErrorNotification(response.data.message),
            logOutUser()
        ));
        return;
    }
    yield put(logInUserSuccess(response.data.email));
    // batching these two actions here would not let Saga know I dispatched a loadFilesRequest
    yield put(loadFilesRequest());
}

export function* watchUserLoginRequest() {
    yield takeEvery(LOG_IN_USER_REQUEST, validateUser);
}