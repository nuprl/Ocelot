import { Action } from 'redux';

// Action types
export const LOAD_FILES_REQUEST = 'LOAD_FILES_REQUEST';
export const LOAD_FILES_SUCCESS = 'LOAD_FILES_SUCCESS';
export const LOAD_FILES_FAILURE = 'LOAD_FILES_FAILURE';
export const CREATE_NEW_FILE = 'CREATE_NEW_FILE';
// this should have a saga 
export const EDIT_FILE_LOCAL = 'EDIT_FILE_LOCAL';
export const EDIT_FILE_CLOUD = 'EDIT_FILE_CLOUD';
// this should also have a saga
export const SELECT_FILE = 'SELECT_FILE';
export const DELETE_FILE = 'DELETE_FILE';
// this should also have a saga
export const MARK_FILE_NOT_SAVED = 'MARK_FILE_NOT_SAVED';
export const MARK_FILE_SAVED = 'MARK_FILE_SAVED';
export const TRIGGER_NEW_FILE_ERROR = 'TRIGGER_NEW_FILE_ERROR';
export const RESET_DEFAULT_FILES = 'RESET_DEFAULT_FILES';

export type UserFile = { name: string, content: string };

export type UserFiles = UserFile[];

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

export interface CreateNewFileAction extends Action {
    type: 'CREATE_NEW_FILE';
    fileName: string;
    loggedIn: boolean;
}

export interface SelectFileAction extends Action {
    type: 'SELECT_FILE';
    fileIndex: number;
}

export interface DeleteFileAction extends Action {
    type: 'DELETE_FILE';
    fileIndex: number;
    fileName: string;
    loggedIn: boolean;
}

export interface EditFileLocalAction extends Action {
    type: 'EDIT_FILE_LOCAL';
    fileIndex: number;
    content: string;
}

export interface EditFileCloudAction extends Action {
    type: 'EDIT_FILE_CLOUD';
    fileName: string;
    fileIndex: number;
    // not using fileIndex because fileName for saga post request
    content: string;
    loggedIn: boolean;
}

export interface MarkFileNotSavedAction extends Action {
    type: 'MARK_FILE_NOT_SAVED';
    fileIndex: number;
}

export interface MarkFileSavedAction extends Action {
    type: 'MARK_FILE_SAVED';
    fileIndex: number;
}

export interface ResetDefaultFilesAction extends Action {
    type: 'RESET_DEFAULT_FILES';
}

export type UserFilesActions =
    | LoadFilesRequestAction
    | LoadFilesSuccessAction
    | LoadFilesFailureAction
    | CreateNewFileAction
    | SelectFileAction
    | DeleteFileAction
    | EditFileLocalAction
    | EditFileCloudAction
    | MarkFileSavedAction
    | MarkFileNotSavedAction
    | ResetDefaultFilesAction;

export type ChangeFileActions =
    | CreateNewFileAction
    | DeleteFileAction
    | EditFileCloudAction;

// State type
export type UserFilesState = {
    folderInfo: {
        filesLoading: boolean
    },
    filesInfo: {
        files: UserFiles,
        selectedFileIndex: number,
        fileSaved: boolean[],
    }
};