import { call, put, takeEvery } from 'redux-saga/effects';
import * as t from './types';
import { loadFilesFailure, markFileSaved, } from '../../store/userFiles/actions';
import * as state from '../../state';
import { UserFilesResponse, getUserFiles } from '../../utils/api/getUserFiles';
import { SaveFilesResponse, saveChanges } from '../../utils/api/saveFileChanges';
import { isFailureResponse, FileChange } from '../../utils/api/apiHelpers';

function* fetchFiles(action: t.LoadFilesRequestAction) {
    const response: UserFilesResponse = yield call(getUserFiles);
    if (isFailureResponse(response)) {
        state.notification.next({ message: response.data.message, position: 'top' });
        yield put(
                loadFilesFailure()
        );
        return;
    }
    // yield put(loadFilesSuccess(response.data.userFiles));
    // loading files somewhere else
}

export function* watchLoadUserFilesRequest() {
    yield takeEvery(t.LOAD_FILES_REQUEST, fetchFiles);
}

const isDeleteFileAction =
    (arg: t.ChangeFileActions): arg is t.DeleteFileAction => (arg.type === 'DELETE_FILE');

const isEditFileAction =
    (arg: t.ChangeFileActions): arg is t.EditFileCloudAction => (arg.type === 'EDIT_FILE_CLOUD');

function* makeFileChanges(action: t.ChangeFileActions) {
    if (!action.loggedIn) {
        return;
    } 
    let fileChangeRequest: FileChange[] = [
        {
            fileName: action.fileName,
            type: 'create',
            changes: '',
        }
    ];
    if (isDeleteFileAction(action)) {
        state.notification.next({ message: 'Removing file ...', position: 'top' });
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
        state.notification.next({ message: 'Unable to connect to the Internet, retrying ...', position: 'top' });
        return; // TODO(arjun): This was nothing but a notification. wtf?
    }
    if (isFailureResponse(response)) {
        // TODO(arjun): oops
        state.notification.next({ message: 'Your session may be expired, try refreshing the page and try again', position: 'top' });
        return;
    }
    if (isDeleteFileAction(action)) {
        state.notification.next({ message: `Deleted ${action.fileName}`, position: 'top' });
        return;
    }
    if (isEditFileAction(action)) {
        yield put(markFileSaved(action.fileIndex));
        return;
    }
    state.notification.next({ message: `Created ${action.fileName}`, position: 'bottom-right' });
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
