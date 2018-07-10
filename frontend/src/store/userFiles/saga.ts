import { call, put, takeEvery } from 'redux-saga/effects';
import * as t from './types';
import { triggerErrorNotification } from 'store/errorNotification/actions';
import { logOutUser } from 'store/userLogin/actions';
import { loadFilesSuccess, loadFilesFailure } from 'store/userFiles/actions';
import { batchActions } from 'store/batchActions';

import { UserFilesResponse, getUserFiles } from 'utils/api/getUserFiles';
import { SaveFilesResponse, saveChanges } from 'utils/api/saveFileChanges';
import { isFailureResponse, FileChange } from 'utils/api/apiHelpers';

function* fetchFiles(action: t.LoadFilesRequestAction) {
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
    yield takeEvery(t.LOAD_FILES_REQUEST, fetchFiles);
}

const isDeleteFileAction =
    (arg: t.ChangeFileActions): arg is t.DeleteFileAction => (arg.type === 'DELETE_FILE');

const isEditFileAction =
    (arg: t.ChangeFileActions): arg is t.EditFileRequestAction => (arg.type === 'EDIT_FILE_REQUEST');

function* makeFileChanges(action: t.ChangeFileActions) {
    let fileChangeRequest: FileChange[] = [
        {
            fileName: action.fileName,
            type: 'create',
            changes: '',
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
    if (isEditFileAction(action)) {
        fileChangeRequest = [
            {
                ...fileChangeRequest[0],
                changes: action.content
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
    yield takeEvery(t.CREATE_NEW_FILE, makeFileChanges);
}

export function* watchDeleteFile() {
    yield takeEvery(t.DELETE_FILE, makeFileChanges);
}

// watch edit file but not constantly, new action may be needed