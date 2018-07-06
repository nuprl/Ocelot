import { call, put, takeEvery } from 'redux-saga/effects';
import {
    LoadFilesRequestAction,
    CreateNewFileAction,
    DeleteFileAction,
    CREATE_NEW_FILE,
    DELETE_FILE,
    LOAD_FILES_REQUEST
} from './types';
import { triggerErrorNotification } from 'store/errorNotification/actions';
import { logOutUser } from 'store/userLogin/actions';
import { loadFilesSuccess, loadFilesFailure } from 'store/userFiles/actions';
import { batchActions } from 'store/batchActions';

import { UserFilesResponse, getUserFiles } from 'utils/api/getUserFiles';
import { SaveFilesResponse, saveChanges } from 'utils/api/saveFileChanges';
import { isFailureResponse, FileChange } from 'utils/api/apiHelpers';

function* fetchFiles(action: LoadFilesRequestAction) {
    const response: UserFilesResponse = yield call(getUserFiles);
    if (isFailureResponse(response)) {
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

const isDeleteFileAction =
    (arg: CreateNewFileAction | DeleteFileAction): arg is DeleteFileAction => (arg.type === 'DELETE_FILE');

function* makeFileChanges(action: CreateNewFileAction | DeleteFileAction) {
    let fileChangeRequest: FileChange[] = [
        {
            fileName: action.fileName,
            type: 'create',
        }
    ];
    if (isDeleteFileAction(action)) {
        fileChangeRequest = [
            {
                fileName: action.fileName,
                type: 'delete'
            }
        ];
    }
    const response: SaveFilesResponse = yield call(saveChanges, fileChangeRequest);
    if (isFailureResponse(response)) {
        yield put(
            triggerErrorNotification(`Your session may be expired, try refreshing the page and try again`)
            // A better way to handle this is best
        );
    }
}

export function* watchCreateNewFile() {
    yield takeEvery(CREATE_NEW_FILE, makeFileChanges);
}

export function* watchDeleteFile() {
    yield takeEvery(DELETE_FILE, makeFileChanges);
}