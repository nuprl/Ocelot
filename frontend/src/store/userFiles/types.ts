import { Action } from 'redux';

// Action types
export const LOAD_FILES_REQUEST = 'LOAD_FILES_REQUEST';
export const LOAD_FILES_SUCCESS = 'LOAD_FILES_SUCCESS';
export const LOAD_FILES_FAILURE = 'LOAD_FILES_FAILURE';
export const TOGGLE_FILES_FOLDER = 'TOGGLE_FILES_FOLDER';
export const OPEN_FILES_FOLDER = 'OPEN_FILES_FOLDER';
export const CLOSE_FILES_FOLDER = 'CLOSE_FILES_FOLDER';
export const CREATE_NEW_FILE_FIELD = 'CREATE_NEW_FILE_FIELD';
export const DELETE_NEW_FILE_FIELD = 'DELETE_NEW_FILE_FIELD';
export const CREATE_NEW_FILE = 'CREATE_NEW_FILE';
// this should have a saga 
export const EDIT_FILE = 'EDIT_FILE';
// this should also have a saga
export const SELECT_FILE = 'SELECT_FILE';
export const DELETE_FILE = 'DELETE_FILE';
// this should also have a saga
export const TRIGGER_NEW_FILE_ERROR = 'TRIGGER_NEW_FILE_ERROR';
export const CLEAR_FILES = 'CLEAR_FILES';
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

export interface ToggleFilesFolderAction extends Action {
    type: 'TOGGLE_FILES_FOLDER';
}

export interface OpenFilesFolderAction extends Action {
    type: 'OPEN_FILES_FOLDER';
}

export interface CloseFilesFolderAction extends Action {
    type: 'CLOSE_FILES_FOLDER';
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

export interface EditFileAction extends Action {
    type: 'EDIT_FILE';
    fileIndex: number; // for reducer
    fileName: string; // for saga post request
    content: string; // to update code
}

export interface ClearFilesAction extends Action {
    type: 'CLEAR_FILES';
}

export interface ResetDefaultFilesAction extends Action {
    type: 'RESET_DEFAULT_FILES';
}

export type UserFilesActions =
    | LoadFilesRequestAction
    | LoadFilesSuccessAction
    | LoadFilesFailureAction
    | ToggleFilesFolderAction
    | OpenFilesFolderAction
    | CloseFilesFolderAction
    | CreateNewFileFieldAction
    | DeleteNewFileFieldAction
    | CreateNewFileAction
    | SelectFileAction
    | DeleteFileAction
    | TriggerNewFileErrorAction
    | EditFileAction
    | ClearFilesAction
    | ResetDefaultFilesAction;

export type ChangeFileActions =
    | CreateNewFileAction
    | DeleteFileAction
    | EditFileAction;

// State type

export type UserFilesState = {
    folderInfo: {
        filesLoading: boolean
        open: boolean,
    },
    filesInfo: {
        files: UserFiles,
        selectedFileIndex: number,
        newFile: boolean,
        newFileError: boolean,
        fileSaved: boolean[],
    }
};