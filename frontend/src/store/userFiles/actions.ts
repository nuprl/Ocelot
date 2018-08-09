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

export const createNewFile: ActionCreator<t.CreateNewFileAction>
    = (fileName: string, loggedIn: boolean) => ({
        type: t.CREATE_NEW_FILE,
        fileName: fileName,
        loggedIn: loggedIn
    });

export const selectFile: ActionCreator<t.SelectFileAction>
    = (fileIndex: number) => ({
        type: t.SELECT_FILE,
        fileIndex: fileIndex
    });

export const deleteFile: ActionCreator<t.DeleteFileAction>
    = (fileIndex: number, fileName: string, loggedIn: boolean) => ({
        type: t.DELETE_FILE,
        fileIndex: fileIndex,
        fileName: fileName,
        loggedIn: loggedIn
    });

export const editFileLocal: ActionCreator<t.EditFileLocalAction>
    = (fileIndex: number, content: string) => ({
        type: t.EDIT_FILE_LOCAL,
        fileIndex: fileIndex,
        content: content,
    });

export const editFileCloud: ActionCreator<t.EditFileCloudAction>
    = (fileName: string, fileIndex: number, content: string, loggedIn: boolean) => ({
        type: t.EDIT_FILE_CLOUD,
        fileName: fileName,
        fileIndex: fileIndex,
        content: content,
        loggedIn: loggedIn,
    });

export const markFileNotSaved: ActionCreator<t.MarkFileNotSavedAction>
= (fileIndex: number) => ({
    type: t.MARK_FILE_NOT_SAVED,
    fileIndex: fileIndex,
});

export const markFileSaved: ActionCreator<t.MarkFileSavedAction>
 = (fileIndex: number) => ({
     type: t.MARK_FILE_SAVED,
     fileIndex: fileIndex,
 });

export const resetDefaultFiles: ActionCreator<t.ResetDefaultFilesAction>
    = () => ({
        type: t.RESET_DEFAULT_FILES
    });