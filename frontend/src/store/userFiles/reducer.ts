import { Reducer } from 'redux';
import * as t from './types';

const helloWorldCode = `
/**
 * @param name to greet
 * @returns a greeting
 */
function greeting(name) {
    return \`Hello \${name}!\`
}

console.log(greeting('World'));
`;

const initialState: t.UserFilesState = {
    folderInfo: {
        open: true,
        filesLoading: false,
    },
    filesInfo: {
        files: [{
            name: 'helloWorld.js',
            content: helloWorldCode
        }],
        selectedFileIndex: 0,
        newFile: false,
        newFileError: false,
        fileSaved: [true]
    }
};

const userFiles: Reducer<t.UserFilesState> = (
    state: t.UserFilesState = initialState,
    action: t.UserFilesActions): t.UserFilesState => {
    switch (action.type) {
        case t.LOAD_FILES_REQUEST:
            return {
                ...state,
                folderInfo: {
                    filesLoading: true,
                    open: false,
                }
            };
        case t.LOAD_FILES_SUCCESS:
            return {
                filesInfo: {
                    ...state.filesInfo,
                    files: action.userFiles,
                    fileSaved: new Array(action.userFiles.length).fill(true)
                },
                folderInfo: {
                    ...state.folderInfo,
                    filesLoading: false,
                }
            };
        case t.LOAD_FILES_FAILURE:
            return {
                ...state,
                folderInfo: {
                    ...state.folderInfo,
                    filesLoading: false,
                }
            };
        case t.TOGGLE_FILES_FOLDER:
            return {
                ...state,
                folderInfo: {
                    ...state.folderInfo,
                    open: !state.folderInfo.open
                }
            };
        case t.OPEN_FILES_FOLDER:
            return {
                ...state,
                folderInfo: {
                    ...state.folderInfo,
                    open: true,
                }
            };
        case t.CLOSE_FILES_FOLDER:
            return {
                ...state,
                folderInfo: {
                    ...state.folderInfo,
                    open: false,
                }
            };
        case t.CREATE_NEW_FILE_FIELD:
            return {
                filesInfo: {
                    ...state.filesInfo,
                    newFile: true,
                },
                folderInfo: {
                    ...state.folderInfo,
                    open: true,
                }
            };
        case t.DELETE_NEW_FILE_FIELD:
            return {
                ...state,
                filesInfo: {
                    ...state.filesInfo,
                    newFile: false,
                }
            };
        case t.CREATE_NEW_FILE:
            return {
                ...state,
                filesInfo: {
                    ...state.filesInfo,
                    files: [
                        ...state.filesInfo.files,
                        {
                            name: action.fileName,
                            content: ''
                        },
                    ],
                    newFileError: false,
                    fileSaved: [
                        ...state.filesInfo.fileSaved,
                        true,
                    ]
                }
            };
        case t.SELECT_FILE:
            return {
                ...state,
                filesInfo: {
                    ...state.filesInfo,
                    selectedFileIndex: action.fileIndex
                }
            };
        case t.DELETE_FILE:
            const isFileIndex
                = (elem: boolean | t.UserFile, index: number) => index !== action.fileIndex;
            const newFiles = state.filesInfo.files.filter(isFileIndex);
            const newIsSaved = state.filesInfo.fileSaved.filter(isFileIndex);
            let newState = {
                ...state,
                filesInfo: {
                    ...state.filesInfo,
                    files: newFiles,
                    fileSaved: newIsSaved
                }
            };
            if (action.fileIndex === state.filesInfo.selectedFileIndex) {
                newState.filesInfo.selectedFileIndex = -1;
            }
            return newState;
        case t.TRIGGER_NEW_FILE_ERROR:
            return {
                ...state,
                filesInfo: {
                    ...state.filesInfo,
                    newFileError: true
                }
            };
        case t.RESET_DEFAULT_FILES:
            return {
                ...initialState
            };
        default:
            return state;
    }
};

export default userFiles;