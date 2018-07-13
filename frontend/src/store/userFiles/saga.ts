import { call, put, takeEvery } from 'redux-saga/effects';
import * as t from './types';
import { triggerNotification } from 'store/notification/actions';
import { logOutUser } from 'store/userLogin/actions';
import { loadFilesSuccess, loadFilesFailure, markFileSaved, } from 'store/userFiles/actions';
import { batchActions } from 'store/batchActions';

import { UserFilesResponse, getUserFiles } from 'utils/api/getUserFiles';
import { SaveFilesResponse, saveChanges } from 'utils/api/saveFileChanges';
import { isFailureResponse, FileChange } from 'utils/api/apiHelpers';

function* fetchFiles(action: t.LoadFilesRequestAction) {
    const response: UserFilesResponse = yield call(getUserFiles);
    if (isFailureResponse(response)) {
        yield put(
            batchActions(
                triggerNotification(response.data.message, 'top'),
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
    (arg: t.ChangeFileActions): arg is t.EditFileCloudAction => (arg.type === 'EDIT_FILE_CLOUD');

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
    if (isEditFileAction(action) && isFailureResponse(response)) {
        yield put(batchActions(
            triggerNotification('Unabled to connect to the internet, retrying...', 'bottom-right'),
            // have a loading icon of some sort.
            // editFileFailure(),
        ));
        return;
    }
    if (isFailureResponse(response)) {
        yield put(
            triggerNotification(`Your session may be expired, try refreshing the page and try again`, 'top')
            // A better way to handle this is best
        );
        return;
    }
    if (isDeleteFileAction(action)) {
        yield put(triggerNotification(`File deleted: ${action.fileName}`, 'bottom-right'));
        return;
    }
    if (isEditFileAction(action)) {
        yield put(markFileSaved(action.fileIndex));
        return;
    }
    yield put(triggerNotification(`File created: ${action.fileName}`, 'bottom-right'));
}

export function* watchCreateNewFile() {
    yield takeEvery(t.CREATE_NEW_FILE, makeFileChanges);
}

export function* watchDeleteFile() {
    yield takeEvery(t.DELETE_FILE, makeFileChanges);
}

export function* watchEditFile() {
    yield takeEvery(t.EDIT_FILE_CLOUD, makeFileChanges);
}

// watch edit file but not constantly, new action may be needed