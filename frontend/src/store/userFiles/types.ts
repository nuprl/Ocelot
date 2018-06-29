import { Action } from 'redux';

// Action types
export const LOAD_FILES_REQUEST = 'LOAD_FILES_REQUEST';
export const LOAD_FILES_SUCCESS = 'LOAD_FILES_SUCCESS'; 
// Failures are handled by the saga and user is notified accordingly
export const OPEN_FILES_FOLDER = 'OPEN_FILES_FOLDER';
export const CLOSE_FILES_FOLDER = 'CLOSE_FILES_FOLDER';

export interface LoadFilesRequestAction {
    type: 'LOAD_FILES_REQUEST'
}

export interface LoadFilesSuccessAction {
    type: 'LOAD_FILES_SUCCESS'
}

export interface OpenFilesFolderAction {
    type: 'OPEN_FILES_FOLDER'
}

export interface CloseFilesFolderAction {
    type: 'CLOSE_FILES_FOLDER'
}

export type UserFilesActions =
    | LoadFilesRequestAction
    | LoadFilesSuccessAction
    | OpenFilesFolderAction
    | CloseFilesFolderAction;

// State type

export type UserFilesState = {
    folderInfo: {
        open: boolean,
        filesLoading: boolean
    },
    filesInfo: {
        files: { name: string, content: string }[],
        selectedFileIndex: number,
        newFile: boolean,
        fileSaved: boolean[],
    }
}