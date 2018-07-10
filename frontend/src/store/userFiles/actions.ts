import * as t from './types';
import { ActionCreator } from 'redux';

export const loadFilesRequest: ActionCreator<t.LoadFilesRequestAction>
    = () => ({
        type: t.LOAD_FILES_REQUEST
    });

export const loadFilesSuccess: ActionCreator<t.LoadFilesSuccessAction>
    = (userFiles: t.UserFiles) => ({
        type: t.LOAD_FILES_SUCCESS,
        userFiles: userFiles
    });

export const loadFilesFailure: ActionCreator<t.LoadFilesFailureAction>
    = () => ({
        type: t.LOAD_FILES_FAILURE
    });

export const toggleFilesFolder: ActionCreator<t.ToggleFilesFolderAction>
    = () => ({
        type: t.TOGGLE_FILES_FOLDER
    });

export const openFilesFolder: ActionCreator<t.OpenFilesFolderAction>
    = () => ({
        type: t.OPEN_FILES_FOLDER
    });

export const closeFilesFolder: ActionCreator<t.CloseFilesFolderAction>
    = () => ({
        type: t.CLOSE_FILES_FOLDER
    });

export const createNewFileField: ActionCreator<t.CreateNewFileFieldAction>
    = () => ({
        type: t.CREATE_NEW_FILE_FIELD
    });

export const deleteNewFileField: ActionCreator<t.DeleteNewFileFieldAction>
    = () => ({
        type: t.DELETE_NEW_FILE_FIELD
    });

export const createNewFile: ActionCreator<t.CreateNewFileAction>
    = (fileName: string) => ({
        type: t.CREATE_NEW_FILE,
        fileName: fileName
    });

export const selectFile: ActionCreator<t.SelectFileAction>
    = (fileIndex: number) => ({
        type: t.SELECT_FILE,
        fileIndex: fileIndex
    });

export const deleteFile: ActionCreator<t.DeleteFileAction>
    = (fileIndex: number, fileName: string) => ({
        type: t.DELETE_FILE,
        fileIndex: fileIndex,
        fileName: fileName
    });

export const triggerNewFileError: ActionCreator<t.TriggerNewFileErrorAction>
    = () => ({
        type: t.TRIGGER_NEW_FILE_ERROR
    });

export const editFileRequest: ActionCreator<t.EditFileRequestAction>
    = (fileName: string, content: string) => ({
        type: t.EDIT_FILE_REQUEST,
        fileName: fileName,
        content: content,
    });

export const editFileSuccess: ActionCreator<t.EditFileSuccessAction>
    = () => ({
        type: t.EDIT_FILE_SUCCESS,
    });

export const editFileFailure: ActionCreator<t.EditFileFailureAction>
    = () => ({
        type: t.EDIT_FILE_FAILURE
    });

export const resetDefaultFiles: ActionCreator<t.ResetDefaultFilesAction>
    = () => ({
        type: t.RESET_DEFAULT_FILES
    });