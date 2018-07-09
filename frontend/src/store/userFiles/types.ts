import { Action } from 'redux';

// Action types
export const LOAD_FILES_REQUEST = 'LOAD_FILES_REQUEST';
export const LOAD_FILES_SUCCESS = 'LOAD_FILES_SUCCESS';
export const LOAD_FILES_FAILURE = 'LOAD_FILES_FAILURE';
export const CREATE_NEW_FILE_FIELD = 'CREATE_NEW_FILE_FIELD';
export const DELETE_NEW_FILE_FIELD = 'DELETE_NEW_FILE_FIELD';
export const CREATE_NEW_FILE = 'CREATE_NEW_FILE';
// this should have a saga 
export const SELECT_FILE = 'SELECT_FILE';
export const DELETE_FILE = 'DELETE_FILE';
// this should also have a saga
export const TRIGGER_NEW_FILE_ERROR = 'TRIGGER_NEW_FILE_ERROR';

export type UserFiles = { name: string, content: string }[];

export interface LoadFilesRequestAction extends Action {
    type: 'LOAD_FILES_REQUEST';
}

export interface LoadFilesSuccessAction extends Action {
    type: 'LOAD_FILES_SUCCESS';
    userFiles: UserFiles;
}

export interface LoadFilesFailureAction extends Action {
    type: 'LOAD_FILES_FAILURE';
}

export interface CreateNewFileFieldAction extends Action {
    type: 'CREATE_NEW_FILE_FIELD';
}

export interface DeleteNewFileFieldAction extends Action {
    type: 'DELETE_NEW_FILE_FIELD';
}

export interface CreateNewFileAction extends Action {
    type: 'CREATE_NEW_FILE';
    fileName: string;
}

export interface SelectFileAction extends Action {
    type: 'SELECT_FILE';
    fileIndex: number;
}

export interface DeleteFileAction extends Action {
    type: 'DELETE_FILE';
    fileIndex: number;
    fileName: string;
}

export interface TriggerNewFileErrorAction extends Action {
    type: 'TRIGGER_NEW_FILE_ERROR';
}

export type UserFilesActions =
    | LoadFilesRequestAction
    | LoadFilesSuccessAction
    | LoadFilesFailureAction
    | CreateNewFileFieldAction
    | DeleteNewFileFieldAction
    | CreateNewFileAction
    | SelectFileAction
    | DeleteFileAction
    | TriggerNewFileErrorAction;

// State type

export type UserFilesState = {
    folderInfo: {
        filesLoading: boolean
    },
    filesInfo: {
        files: UserFiles,
        selectedFileIndex: number,
        newFile: boolean,
        newFileError: boolean,
        fileSaved: boolean[],
    }
};