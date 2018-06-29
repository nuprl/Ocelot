import { Action } from 'redux';

// Action types
export const LOAD_FILES_REQUEST = 'LOAD_FILES_REQUEST';
export const LOAD_FILES_SUCCESS = 'LOAD_FILES_SUCCESS'; 
// Failures are handled by the saga and user is notified accordingly
export const TOGGLE_FILES_FOLDER = 'TOGGLE_FILES_FOLDER';
export const CREATE_NEW_FILE_FIELD = 'CREATE_NEW_FILE_FIELD';
export const DELETE_NEW_FILE_FIELD = 'DELETE_NEW_FILE_FIELD';
export const CREATE_NEW_FILE = 'CREATE_NEW_FILE';

export type UserFiles = { name: string, content: string }[];

export interface LoadFilesRequestAction {
    type: 'LOAD_FILES_REQUEST'
}

export interface LoadFilesSuccessAction {
    type: 'LOAD_FILES_SUCCESS';
    userFiles: UserFiles
}

export interface ToggleFilesFolderAction {
    type: 'TOGGLE_FILES_FOLDER'
}

export interface CreateNewFileFieldAction {
    type: 'CREATE_NEW_FILE_FIELD'
}

export interface DeleteNewFileFieldAction {
    type: 'DELETE_NEW_FILE_FIELD';
}

export interface CreateNewFileAction {
    type: 'CREATE_NEW_FILE';
    fileName: string,
}

export type UserFilesActions =
    | LoadFilesRequestAction
    | LoadFilesSuccessAction
    | ToggleFilesFolderAction
    | CreateNewFileFieldAction
    | DeleteNewFileFieldAction
    | CreateNewFileAction;

// State type

export type UserFilesState = {
    folderInfo: {
        open: boolean,
        filesLoading: boolean
    },
    filesInfo: {
        files: UserFiles,
        selectedFileIndex: number,
        newFile: boolean,
        fileSaved: boolean[],
    }
}