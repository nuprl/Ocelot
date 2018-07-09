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