import { call, put, takeEvery } from 'redux-saga/effects';
import { LoadFilesRequestAction, LOAD_FILES_REQUEST } from './types';
import { triggerErrorNotification } from 'store/errorNotification/actions';
import { logOutUser } from 'store/userLogin/actions';
import { loadFilesSuccess, loadFilesFailure } from 'store/userFiles/actions';
import { batchActions } from 'store/batchActions';

import * as Api from 'containers/FilesFolder/Api';

function* fetchFiles(action: LoadFilesRequestAction) {
    const response: Api.UserFilesResponse = yield call(Api.getUserFiles);
    if (Api.isFailureResponse(response)) {
        yield put(
            batchActions(
                triggerErrorNotification(response.data.message),
                loadFilesFailure(),
                logOutUser()
            )
        );
        return;
    }
    yield put(loadFilesSuccess(response.data.userFiles));
}

export function* watchLoadUserFilesRequest() {
    yield takeEvery(LOAD_FILES_REQUEST, fetchFiles);
}