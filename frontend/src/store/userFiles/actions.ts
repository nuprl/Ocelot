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

export const toggleFilesFolder: ActionCreator<t.ToggleFilesFolderAction>
    = () => ({
        type: t.TOGGLE_FILES_FOLDER
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
}) 